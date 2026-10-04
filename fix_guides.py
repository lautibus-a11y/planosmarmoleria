import re

with open('index.html', 'r', encoding='utf8') as f:
    c = f.read()

# 1. Remove the unreachable block for text guides
c = re.sub(
    r'} else if \(this\._activeEl\.type === \'text\' && this\._activeCtrl === \'pos\'\) \{.*?Renderer\.renderAll\(\);\n *return;\n *\}',
    '}',
    c,
    flags=re.DOTALL
)

# 2. Insert the smart guides inside the main move block for text
text_guide_code = """
                        if (this._activeEl.type === 'text') {
                            let guides = [];
                            let snappedX = wp.x;
                            let snappedY = wp.y;
                            const targetsX = new Set();
                            const targetsY = new Set();
                            
                            App.data.elements.forEach(el => {
                                if (el.id === this._activeEl.id) return;
                                let cx = null, cy = null;
                                if (el.start && el.end) {
                                    cx = (el.start.x + el.end.x) / 2; cy = (el.start.y + el.end.y) / 2;
                                    targetsX.add(el.start.x); targetsX.add(el.end.x); targetsX.add(cx);
                                    targetsY.add(el.start.y); targetsY.add(el.end.y); targetsY.add(cy);
                                } else if (el.center) {
                                    targetsX.add(el.center.x); targetsY.add(el.center.y);
                                } else if (el.position) {
                                    targetsX.add(el.position.x); targetsY.add(el.position.y);
                                }
                            });

                            const textStr = this._activeEl.text || "Anotación";
                            const vs = (typeof this._activeEl.visualScale === 'number') ? this._activeEl.visualScale : 1.0;
                            const tagW = Math.max(68, textStr.length * 8 + 22) * vs;
                            const tCx = wp.x + (tagW - 20 * vs) / 2;
                            const tCy = wp.y;

                            const snapThreshold = 10 / (App.viewport.scale || 1);
                            let minDx = snapThreshold, minDy = snapThreshold;

                            targetsX.forEach(tx => {
                                if (Math.abs(tCx - tx) < minDx) {
                                    minDx = Math.abs(tCx - tx);
                                    snappedX = tx - (tagW - 20 * vs) / 2;
                                    guides = guides.filter(g => g.type !== 'v');
                                    guides.push({ type: 'v', x: tx });
                                }
                            });

                            targetsY.forEach(ty => {
                                if (Math.abs(tCy - ty) < minDy) {
                                    minDy = Math.abs(tCy - ty);
                                    snappedY = ty;
                                    guides = guides.filter(g => g.type !== 'h');
                                    guides.push({ type: 'h', y: ty });
                                }
                            });

                            this._activeEl.position = { x: snappedX, y: snappedY };
                            Renderer.drawSnap(null, guides);
                            
                            // Prevent the default movement logic below from running for text
                            Renderer.renderAll();
                            return;
                        }
"""

# Insert before "if (this._activeEl.type === 'terminacion') {"
c = c.replace(
    "if (this._activeEl.type === 'terminacion') {",
    text_guide_code + "\n                        if (this._activeEl.type === 'terminacion') {"
)

with open('index.html', 'w', encoding='utf8') as f:
    f.write(c)
