import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { UploadCloud, Settings2, CheckCircle2, Save, RefreshCw, Download } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { CatalogPDF } from '../components/CatalogPDF';

export default function Editor() {
  const [rawRows, setRawRows] = useState([]);
  const [columns, setColumns] = useState([]);
  const [products, setProducts] = useState([]);
  const [mapping, setMapping] = useState({
    stokKodu: '',
    urunAdi: '',
    fiyat: '',
    resimUrl: ''
  });
  
  const [percentChange, setPercentChange] = useState(0);
  const [projectName, setProjectName] = useState('DZY Katalog 2026');
  const [isSaving, setIsSaving] = useState(false);
  const [pdfReady, setPdfReady] = useState(false);

  // Ürünler veya proje adı değiştiğinde PDF'i yeniden "hazırlanması gerek" moduna al
  useEffect(() => {
    setPdfReady(false);
  }, [products, projectName]);

  // 1. Excel Dosyasını Oku
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      
      if (jsonData.length > 0) {
        setRawRows(jsonData);
        setColumns(Object.keys(jsonData[0]));
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // 2. Sütun Eşleştirme Onayı ve CORS Çözümü
  const confirmMapping = () => {
    if (!mapping.stokKodu || !mapping.urunAdi || !mapping.fiyat) {
      alert("Lütfen en az Stok Kodu, Ürün Adı ve Fiyat sütunlarını eşleştirin.");
      return;
    }

    const formattedData = rawRows.map((item, index) => {
      let finalImageUrl = '';
      if (mapping.resimUrl && item[mapping.resimUrl]) {
        // PDF motoru resimleri indirebilsin diye CORS proxy ekliyoruz
        finalImageUrl = `https://images.weserv.nl/?url=${encodeURIComponent(item[mapping.resimUrl])}&w=300`;
      }

      return {
        id: index,
        stokKodu: String(item[mapping.stokKodu] || ''),
        urunAdi: String(item[mapping.urunAdi] || ''),
        fiyat: parseFloat(item[mapping.fiyat]) || 0,
        resimUrl: finalImageUrl,
        kategori: '',
      };
    });

    setProducts(formattedData);
  };

  // 3. Toplu İşlemler ve Düzenleme
  const applyPercentageChange = () => {
    setProducts(products.map(p => ({
      ...p, 
      fiyat: parseFloat((p.fiyat * (1 + percentChange / 100)).toFixed(2))
    })));
    setPercentChange(0);
  };

  const handleProductChange = (id, field, value) => {
    setProducts(products.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  // 4. Supabase Veritabanına Kayıt İşlemi
  const saveToDatabase = async () => {
    if (!projectName.trim()) {
      alert("Lütfen projeye bir isim verin.");
      return;
    }

    setIsSaving(true);
    try {
      const { data: project, error: pError } = await supabase
        .from('projects')
        .insert([{ name: projectName }])
        .select()
        .single();

      if (pError) throw pError;

      const productsToInsert = products.map(p => ({
        project_id: project.id,
        stok_kodu: p.stokKodu,
        urun_adi: p.urunAdi,
        fiyat: p.fiyat,
        resim_url: p.resimUrl,
        kategori: p.kategori
      }));

      const { error: prodError } = await supabase.from('products').insert(productsToInsert);
      
      if (prodError) throw prodError;
      
      alert("Proje başarıyla kaydedildi!");
    } catch (error) {
      console.error("Kayıt hatası:", error);
      alert("Kayıt sırasında bir hata oluştu: " + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20">
      
      {/* ADIM 1: Excel Yükleme */}
      {rawRows.length === 0 && (
        <div className="bg-white p-12 rounded-2xl shadow-sm border border-gray-200 text-center">
          <UploadCloud className="w-16 h-16 text-blue-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Katalog İçin Excel Yükleyin</h2>
          <label className="bg-gray-900 text-white px-8 py-3 rounded-xl cursor-pointer hover:bg-gray-800 transition">
            Dosya Seç (.xlsx)
            <input type="file" className="hidden" accept=".xlsx, .xls" onChange={handleFileUpload} />
          </label>
        </div>
      )}

      {/* ADIM 2: Sütun Eşleştirme (Mapping) */}
      {rawRows.length > 0 && products.length === 0 && (
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Settings2 className="w-6 h-6 text-blue-600" /> Sütunları Eşleştirin
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {Object.keys(mapping).map((field) => (
              <div key={field} className="space-y-2">
                <label className="text-sm font-semibold text-gray-600 capitalize">
                  {field === 'resimUrl' ? 'Resim Linki Sütunu' : field.replace(/([A-Z])/g, ' $1')}
                </label>
                <select 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                  value={mapping[field]}
                  onChange={(e) => setMapping({...mapping, [field]: e.target.value})}
                >
                  <option value="">Seçiniz...</option>
                  {columns.map(col => <option key={col} value={col}>{col}</option>)}
                </select>
              </div>
            ))}
          </div>
          <button 
            onClick={confirmMapping}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-5 h-5" /> Verileri Çek ve Düzenleyiciyi Aç
          </button>
        </div>
      )}

      {/* ADIM 3: Editör Tablosu ve Kontroller */}
      {products.length > 0 && (
        <div className="space-y-6">
          {/* Üst Panel: Kayıt, PDF ve Hızlı Ayarlar */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 sticky top-24 z-10">
            <div className="flex flex-wrap items-end justify-between gap-6 mb-4 pb-4 border-b">
              {/* Proje Adı */}
              <div className="space-y-1 flex-1 min-w-[200px]">
                <label className="text-xs font-bold text-gray-500 uppercase">Proje Adı</label>
                <input 
                  type="text" 
                  value={projectName} 
                  onChange={(e) => setProjectName(e.target.value)} 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 font-semibold focus:border-blue-500 outline-none"
                />
              </div>

              {/* Fiyat Artış/Azalış */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Fiyat Değişimi (%)</label>
                <div className="flex gap-2">
                  <input type="number" value={percentChange} onChange={(e) => setPercentChange(Number(e.target.value))} className="border border-gray-300 rounded-lg px-3 py-2 w-20 text-center outline-none focus:border-blue-500" />
                  <button onClick={applyPercentageChange} className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700">Uygula</button>
                </div>
              </div>

              {/* Toplu Kategori */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Tümüne Ata</label>
                <select onChange={(e) => setProducts(products.map(p => ({...p, kategori: e.target.value})))} className="border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-blue-500 bg-white">
                  <option value="">Kategori Seç...</option>
                  <option value="Egzoz Ucu">Egzoz Ucu</option>
                  <option value="Varex">Varex</option>
                  <option value="Downpipe">Downpipe</option>
                  <option value="OEM Susturucu">OEM Susturucu</option>
                </select>
              </div>
            </div>

            {/* Aksiyon Butonları */}
            <div className="flex gap-4 justify-end">
              <button 
                onClick={saveToDatabase}
                disabled={isSaving}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold bg-gray-100 text-gray-800 hover:bg-gray-200 transition disabled:opacity-50"
              >
                <Save className="w-5 h-5" />
                {isSaving ? 'Kaydediliyor...' : 'Taslağı Kaydet'}
              </button>

              {/* PDF Hazırlama Mantığı */}
              {!pdfReady ? (
                <button 
                  onClick={() => setPdfReady(true)}
                  className="flex items-center gap-2 bg-orange-500 text-white px-6 py-2.5 rounded-xl font-bold shadow-md hover:bg-orange-600 transition"
                >
                  <RefreshCw className="w-5 h-5" /> PDF Verisini Hazırla
                </button>
              ) : (
                <PDFDownloadLink 
                  document={<CatalogPDF products={products} />} 
                  fileName={`${projectName.replace(/\s+/g, '-').toLowerCase()}-katalog.pdf`}
                  className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold shadow-md hover:bg-blue-700 transition animate-in zoom-in"
                >
                  {({ loading }) => (
                    <>
                      <Download className="w-5 h-5" />
                      {loading ? 'İşleniyor...' : 'PDF İndir'}
                    </>
                  )}
                </PDFDownloadLink>
              )}
            </div>
          </div>

          {/* Ürün Listesi Tablosu */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b">
                  <th className="p-4 font-bold">Görsel</th>
                  <th className="p-4 font-bold">Stok Kodu</th>
                  <th className="p-4 font-bold">Ürün Adı</th>
                  <th className="p-4 font-bold w-32">Fiyat (TL)</th>
                  <th className="p-4 font-bold w-48">Kategori</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="p-4">
                      {product.resimUrl ? (
                        <div className="w-32 h-32 rounded-lg overflow-hidden border bg-white flex items-center justify-center">
                           <img 
                            src={product.resimUrl} 
                            alt="ürün" 
                            className="w-full h-full object-contain"
                            onError={(e) => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/150?text=Hata"; }}
                          />
                        </div>
                      ) : (
                        <div className="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center text-xs text-gray-400 border border-dashed italic">Resim Yok</div>
                      )}
                    </td>
                    <td className="p-4 font-mono text-sm text-gray-600">
                      <input type="text" value={product.stokKodu} onChange={(e) => handleProductChange(product.id, 'stokKodu', e.target.value)} className="bg-transparent border-b border-transparent focus:border-blue-500 outline-none w-full" />
                    </td>
                    <td className="p-4 font-semibold text-gray-800">
                      <input type="text" value={product.urunAdi} onChange={(e) => handleProductChange(product.id, 'urunAdi', e.target.value)} className="bg-transparent border-b border-transparent focus:border-blue-500 outline-none w-full" />
                    </td>
                    <td className="p-4">
                      <input type="number" value={product.fiyat} onChange={(e) => handleProductChange(product.id, 'fiyat', Number(e.target.value))} className="w-full border border-gray-200 rounded px-2 py-1 focus:ring-1 focus:ring-blue-500 outline-none" />
                    </td>
                    <td className="p-4">
                      <select value={product.kategori} onChange={(e) => handleProductChange(product.id, 'kategori', e.target.value)} className="w-full border border-gray-200 rounded px-2 py-1 text-sm outline-none bg-white">
                        <option value="">Seçiniz</option>
                        <option value="Egzoz Ucu">Egzoz Ucu</option>
                        <option value="Varex">Varex</option>
                        <option value="Downpipe">Downpipe</option>
                        <option value="OEM Susturucu">OEM Susturucu</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}