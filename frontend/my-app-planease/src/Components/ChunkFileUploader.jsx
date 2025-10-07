const uploadImageInChunks = async (image, chunkSize) => {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
    const file = image;
    const totalChunks = Math.ceil(file.size / chunkSize);

    for (let i = 0; i < totalChunks; i++) {
        const from = i * chunkSize;
        const to = Math.min(from + chunkSize, file.size);
        const blob = file.slice(from, to);
        const buffer = await blob.arrayBuffer();

        const params = new URLSearchParams({
            name: file.name,
            size: file.size,
            currentChunkIndex: i,
            totalChunks: totalChunks,
        });

        try {
            const res = await axios.post(`${API_BASE_URL}/toolitem/upload?${params.toString()}`, buffer, {
                headers: {
                    'Content-Type': 'application/octet-stream',
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });

            if (res.status === 200 && i === totalChunks - 1) {
                return res.data; // Only return image URL after last chunk
            }
        } catch (err) {
            console.error("Chunk upload error:", err);
            throw new Error("Upload failed");
        }
    }
    throw new Error("Image URL not returned"); // fallback safety
};

export default uploadImageInChunks;