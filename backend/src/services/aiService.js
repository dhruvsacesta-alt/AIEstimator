const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');

/**
 * AI Service using OpenAI Vision (GPT-4o-mini) 
 * analyzes moving media to estimate inventory and cost.
 */
class AIService {
    constructor() {
        this.openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;
    }

    async analyzeMovingMedia(files) {
        if (!this.openai || !files || files.length === 0) {
            console.log('OPENAI_API_KEY not found or no files. Using enriched simulation.');
            return this.simulateAnalysis(files);
        }

        try {
            let allDetectedItems = [];

            // Process each file with GPT-4o-mini Vision
            for (const file of files) {
                const items = await this.analyzeSingleFile(file.path);
                allDetectedItems = [...allDetectedItems, ...items];
            }

            // Consolidate duplicates (if two photos show the same item)
            const consolidated = this.consolidateItems(allDetectedItems);

            // Calculate totals based on real found items
            const totalPrice = consolidated.reduce((sum, it) => sum + (this.getUnitPrice(it) * it.quantity), 500);
            const totalVolume = consolidated.reduce((sum, it) => sum + (this.getUnitVolume(it) * it.quantity), 0);

            return {
                items: consolidated.map(it => ({
                    item_name: it.name,
                    quantity: it.quantity,
                    category: this.normalizeCategory(it.category),
                    is_fragile: !!it.fragile
                })),
                estimatedPrice: totalPrice,
                estimatedVolume: `${totalVolume} cu ft`,
                confidenceScore: 0.94
            };

        } catch (error) {
            console.error('Vision Analysis failed, falling back to simulation:', error);
            return this.simulateAnalysis(files);
        }
    }

    async analyzeSingleFile(filePath) {
        try {
            const imageBuffer = fs.readFileSync(path.resolve(filePath));
            const base64Image = imageBuffer.toString('base64');
            const extension = path.extname(filePath).replace('.', '');
            const mimeType = extension === 'jpg' ? 'jpeg' : extension;

            const response = await this.openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [
                    {
                        role: "user",
                        content: [
                            {
                                type: "text",
                                text: `Identify all household items/furniture/appliances in this image for a house move estimate.
                                Return ONLY a valid JSON array of objects. 
                                Each object MUST have: "name", "quantity", "category" (furniture/electronics/appliances/fragile/others), and "fragile" (boolean).
                                Example: [{"name": "Sofa", "quantity": 1, "category": "furniture", "fragile": false}]`
                            },
                            {
                                type: "image_url",
                                image_url: { url: `data:image/${mimeType};base64,${base64Image}` }
                            }
                        ]
                    }
                ],
                max_tokens: 500
            });

            const content = response.choices[0].message.content;
            const jsonStr = content.replace(/```json/g, '').replace(/```/g, '').trim();
            return JSON.parse(jsonStr);
        } catch (err) {
            console.error('Single file vision error:', err.message);
            return [];
        }
    }

    consolidateItems(items) {
        const map = new Map();
        items.forEach(it => {
            const key = it.name.toLowerCase().trim();
            if (map.has(key)) {
                map.get(key).quantity += it.quantity;
            } else {
                map.set(key, { ...it });
            }
        });
        return Array.from(map.values());
    }

    getUnitPrice(item) {
        const cat = item.category?.toLowerCase();
        if (cat === 'furniture') return 150;
        if (cat === 'electronics') return 200;
        if (cat === 'appliances') return 250;
        if (cat === 'fragile') return 100;
        return 50;
    }

    getUnitVolume(item) {
        const cat = item.category?.toLowerCase();
        if (cat === 'furniture') return 40;
        if (cat === 'electronics') return 15;
        if (cat === 'appliances') return 30;
        return 10;
    }

    normalizeCategory(cat) {
        const c = cat?.toLowerCase();
        if (c === 'furniture') return 'Furniture';
        if (c === 'electronics') return 'Electronics';
        if (c === 'appliances') return 'Electronics'; // Map to our DB enum
        if (c === 'fragile') return 'Fragile';
        return 'Misc';
    }

    simulateAnalysis(files) {
        // Fallback for when API Key is missing
        return {
            items: [
                { item_name: 'Simulated Sofa', quantity: 1, category: 'Furniture', is_fragile: false },
                { item_name: 'Simulated TV', quantity: 1, category: 'Electronics', is_fragile: true }
            ],
            estimatedPrice: 1200,
            estimatedVolume: "450 cu ft",
            confidenceScore: 0.85
        };
    }
}

module.exports = new AIService();
