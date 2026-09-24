// Endpoint para persistencia en Cloudflare Pages Functions con Cloudflare R2
// Compatible con rutas:
// GET    /api/planos        -> Listar todos los planos
// POST   /api/planos        -> Guardar o actualizar un plano
// GET    /api/planos/:id    -> Obtener un plano por su ID
// DELETE /api/planos/:id    -> Eliminar un plano por su ID

export async function onRequest(context) {
    const { request, env, params } = context;
    const method = request.method;

    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
    }

    // Verificar si el binding de R2 está configurado en Cloudflare Pages
    if (!env.PLANOS_BUCKET) {
        return Response.json({
            error: 'R2_NOT_CONFIGURED',
            message: 'El bucket R2 no está vinculado. En Cloudflare Pages ve a Settings > Functions > R2 bucket bindings y agrega PLANOS_BUCKET vinculado a tu bucket.'
        }, { status: 503, headers: corsHeaders });
    }

    const pathSegments = params.path || [];
    const id = pathSegments[0] ? String(pathSegments[0]).trim() : null;

    try {
        // 1. OBTENER PLANO POR ID
        if (method === 'GET' && id) {
            const objectKey = `planos/${id}.json`;
            const object = await env.PLANOS_BUCKET.get(objectKey);

            if (!object) {
                return Response.json({
                    error: 'NOT_FOUND',
                    message: `No se encontró el plano con código ${id}`
                }, { status: 404, headers: corsHeaders });
            }

            const data = await object.json();
            return Response.json(data, {
                headers: {
                    ...corsHeaders,
                    'Content-Type': 'application/json',
                    'Cache-Control': 'no-cache, no-store, must-revalidate'
                }
            });
        }

        // 2. LISTAR ÚLTIMOS PLANOS
        if (method === 'GET' && !id) {
            const listed = await env.PLANOS_BUCKET.list({
                prefix: 'planos/',
                limit: 100
            });

            const planos = listed.objects.map(obj => {
                const meta = obj.customMetadata || {};
                const planId = meta.id || obj.key.replace('planos/', '').replace('.json', '');

                let projName = 'Mesada';
                let client = '-';
                let author = '-';
                let sector = 'Cocina';

                try { if (meta.projectName) projName = decodeURIComponent(meta.projectName); } catch(e) {}
                try { if (meta.client) client = decodeURIComponent(meta.client); } catch(e) {}
                try { if (meta.author) author = decodeURIComponent(meta.author); } catch(e) {}
                try { if (meta.sector) sector = decodeURIComponent(meta.sector); } catch(e) {}

                return {
                    id: planId,
                    projectName: projName,
                    client: client,
                    author: author,
                    sector: sector,
                    elementCount: parseInt(meta.elementCount || '0', 10),
                    updatedAt: meta.updatedAt || obj.uploaded.toISOString(),
                    sizeBytes: obj.size
                };
            });

            // Ordenar: más recientes primero
            planos.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

            return Response.json(planos, {
                headers: {
                    ...corsHeaders,
                    'Content-Type': 'application/json',
                    'Cache-Control': 'no-cache, no-store, must-revalidate'
                }
            });
        }

        // 3. GUARDAR / ACTUALIZAR PLANO
        if (method === 'POST') {
            const payload = await request.json();

            // Generar ID amigable corto si no tiene uno asignado
            const planId = payload.id && typeof payload.id === 'string' && payload.id.trim().length > 0
                ? payload.id.trim()
                : 'p-' + Math.random().toString(36).substring(2, 8);

            payload.id = planId;
            const now = new Date().toISOString();
            payload.updatedAt = now;

            const proj = payload.project || {};
            const projectName = (proj.name || 'Mesada').trim();
            const author = (proj.author || '').trim();
            const client = (proj.client || '').trim();
            const sector = (proj.sector || 'Cocina').trim();
            const count = Array.isArray(payload.elements) ? payload.elements.length : 0;

            const objectKey = `planos/${planId}.json`;
            const jsonBody = JSON.stringify(payload);

            // Almacenar en R2 con customMetadata protegida con encodeURIComponent
            await env.PLANOS_BUCKET.put(objectKey, jsonBody, {
                httpMetadata: {
                    contentType: 'application/json'
                },
                customMetadata: {
                    id: planId,
                    projectName: encodeURIComponent(projectName),
                    author: encodeURIComponent(author),
                    client: encodeURIComponent(client),
                    sector: encodeURIComponent(sector),
                    elementCount: String(count),
                    updatedAt: now
                }
            });

            return Response.json({
                success: true,
                id: planId,
                projectName,
                client,
                author,
                sector,
                updatedAt: now
            }, {
                headers: {
                    ...corsHeaders,
                    'Content-Type': 'application/json'
                }
            });
        }

        // 4. ELIMINAR PLANO
        if (method === 'DELETE' && id) {
            const objectKey = `planos/${id}.json`;
            await env.PLANOS_BUCKET.delete(objectKey);
            return Response.json({
                success: true,
                id
            }, {
                headers: {
                    ...corsHeaders,
                    'Content-Type': 'application/json'
                }
            });
        }

        return Response.json({ error: 'Método no permitido' }, { status: 405, headers: corsHeaders });
    } catch (err) {
        console.error('Error en API planos:', err);
        return Response.json({
            error: 'SERVER_ERROR',
            message: err.message
        }, { status: 500, headers: corsHeaders });
    }
}
