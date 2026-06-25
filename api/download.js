// api/download.js
export default async function handler(req, res) {
    // تەنها POST پشتگیری دەکەین
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'تەنها شێوەی POST پشتگیری دەکرێت' });
    }

    const { url } = req.body;

    // پشکنینی لینک
    if (!url || !url.trim()) {
        return res.status(400).json({ error: 'تکایە لینکێک بنوسە' });
    }

    try {
        // ============================================
        //  بەشی TikTok (بە پڕۆکسی خۆڕایی)
        // ============================================
        if (url.includes('tiktok.com')) {
            const proxyUrl = `https://api.tikmate.app/api/lookup?url=${encodeURIComponent(url)}`;
            const response = await fetch(proxyUrl);
            const data = await response.json();

            if (data && data.url) {
                return res.status(200).json({
                    success: true,
                    downloadUrl: data.url,
                    title: data.title || 'ڤیدیۆی TikTok',
                    thumbnail: data.thumb || ''
                });
            } else {
                return res.status(404).json({ error: 'ڤیدیۆ نەدۆزرایەوە لەسەر TikTok' });
            }
        }

        // ============================================
        //  بەشی YouTube (بە ytdl-core)
        // ============================================
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
            // پێویستە یەکەمجار ytdl-core دابمەزرێنیت
            // لە ترمیناڵدا: npm install ytdl-core
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
                thumbnail: info.videoDetails.thumbnails[0].url
            });
        }

        // ============================================
        //  پلاتفۆرمەکانی تر
        // ============================================
        return res.status(400).json({ 
            error: 'ئەم پلاتفۆرمە پشتگیری ناکرێت. تکایە لینکی TikTok یان YouTube بەکاربهێنە.' 
        });

    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ 
            error: 'هەڵەیەکی ناوەکی ڕوویدا. تکایە دووبارە هەوڵبدە.' 
        });
    }
}
