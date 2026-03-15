export const processProductImage = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                // Standardize to 900x1200 (3:4 aspect ratio) to match frontend ProductCard
                const TARGET_WIDTH = 900;
                const TARGET_HEIGHT = 1200;
                const TARGET_ASPECT = TARGET_WIDTH / TARGET_HEIGHT;

                const canvas = document.createElement('canvas');
                canvas.width = TARGET_WIDTH;
                canvas.height = TARGET_HEIGHT;
                const ctx = canvas.getContext('2d');

                if (!ctx) {
                    reject(new Error("Could not get canvas context"));
                    return;
                }

                // Calculate cropping dimensions to cover the canvas (object-fit: cover behavior)
                const imgAspect = img.width / img.height;
                let drawWidth = img.width;
                let drawHeight = img.height;
                let offsetX = 0;
                let offsetY = 0;

                if (imgAspect > TARGET_ASPECT) {
                    // Original image is wider than target => scale to target height, crop sides
                    drawHeight = img.height;
                    drawWidth = img.height * TARGET_ASPECT;
                    offsetX = (img.width - drawWidth) / 2;
                } else if (imgAspect < TARGET_ASPECT) {
                    // Original image is taller than target => scale to target width, crop top/bottom
                    drawWidth = img.width;
                    drawHeight = img.width / TARGET_ASPECT;
                    offsetY = (img.height - drawHeight) / 2;
                }

                // Fill background with white just in case of transparent PNGs
                ctx.fillStyle = "#ffffff";
                ctx.fillRect(0, 0, TARGET_WIDTH, TARGET_HEIGHT);

                // Draw image on canvas (cropping to fit)
                ctx.drawImage(
                    img,
                    offsetX, offsetY, drawWidth, drawHeight, // Source rectangle (cropping)
                    0, 0, TARGET_WIDTH, TARGET_HEIGHT // Destination rectangle (scaling)
                );

                // Export canvas to WebP format for high compression ratio to save bandwidth
                // Using 0.7 quality to ensure it doesn't max out local storage limits too quickly
                const dataUrl = canvas.toDataURL('image/webp', 0.7);
                resolve(dataUrl);
            };

            img.onerror = () => {
                reject(new Error("Failed to load image"));
            };

            if (event.target?.result && typeof event.target.result === 'string') {
                img.src = event.target.result;
            }
        };

        reader.onerror = () => {
            reject(new Error("Failed to read file"));
        };

        reader.readAsDataURL(file);
    });
};
