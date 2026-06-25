export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'تەنها POST' });
    }

    const { url } = req.body;
    if (!url) {
        return res.status(400).json({ error: 'لینک پێویستە' });
    }

    try {
        // ============ TikTok ============
        if (url.includes('tiktok.com') || url.includes('vt.tiktok.com')) {
            // هەوڵی یەکەم: بە TikMate API
            const apiUrl = `https://api.tikmate.app/api/lookup?url=${encodeURIComponent(url)}`;
            const response = await fetch(apiUrl);
            const data = await response.json();

            if (data && data.url) {
                return res.status(200).json({
                    success: true,
                    downloadUrl: data.url,
                    title: data.title || 'ڤیدیۆی TikTok',
                    thumbnail: data.thumb || ''
                });
            } else {
                // هەوڵی دووەم: بە پڕۆکسی جیاواز
                const proxyUrl = `https://corsproxy.io/?https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`;
                const proxyResponse = await fetch(proxyUrl);
                const proxyData = await proxyResponse.json();

                if (proxyData && proxyData.data && proxyData.data.play) {
                    return res.status(200).json({
                        success: true,
                        downloadUrl: proxyData.data.play,
                        title: proxyData.data.title || 'ڤیدیۆی TikTok',
                        thumbnail: proxyData.data.cover || ''
                    });
                }
            }
        }

        // ============ YouTube ============
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
            try {
                const ytdl = await import('ytdl-core');
                const info = await ytdl.default.getInfo(url);
                const format = ytdl.default.chooseFormat(info.formats, {
                    quality: 'highestvideo',
                    filter: 'videoandaudio'
                });

                return res.status(200).json({
                    success: true,
                    downloadUrl: format.url,
                    title: info.videoDetails.title,
                    thumbnail: info.videoDetails.thumbnails[0]?.url || ''
                });
            } catch (ytError) {
                return res.status(404).json({ error: 'ڤیدیۆی YouTube نەدۆزرایەوە' });
            }
        }

        return res.status(400).json({ error: 'ئەم پلاتفۆرمە پشتگیری ناکرێت' });

    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({
            error: 'هەڵەیەکی ناوەکی ڕوویدا. تکایە دووبارە هەوڵبدە'
        });
    }
}
