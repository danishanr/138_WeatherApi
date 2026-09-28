const express = require("express");
const axios = require("axios");
const path = require("path");

const app = express();
const PORT = 3000;

app.use(express.static(path.join(__dirname, "public")));

// Contoh: /api/lokasi?kota=Bandung
app.get("/api/lokasi", async (req, res) => {
    const kota = (req.query.kota || "").trim();

    if (!kota) {
        return res.status(400).json({ message: "Nama kota wajib diisi" });
    }

    const apikey = "TmW3n2IbOKaZxkghOoYB";

    const url = `https://api.maptiler.com/geocoding/${encodeURIComponent(kota)}.json?key=${apikey}`;

    try {
        const response = await axios.get(url);
        const features = response.data.features;

        if (!features || features.length === 0) {
            return res.status(404).json({ message: "Kota tidak ditemukan" });
        }

        const hasil = features[0];
        const [lon, lat] = hasil.geometry.coordinates;

        const wilayah = {};
        [hasil, ...(hasil.context || [])].forEach((f) => {
            const jenis = (f.id || "").split(".")[0];
            if (jenis && !wilayah[jenis]) {
                wilayah[jenis] = f.text;
            }
        });

        res.json({
            negara: wilayah.country || "-",
            provinsi: wilayah.region || "-",
            kecematan: wilayah.municipal_district || wilayah.county || wilayah.subregion || "-",
            longitude: lon,
            latitude: lat
        });

    } catch (error) {
        console.error(error.message);

        res.status(500).json({
            message: "Gagal mengambil data dari MapTiler"
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server berjalan di http://127.0.0.1:${PORT}`);
});