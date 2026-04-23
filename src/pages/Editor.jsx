import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { 
  UploadCloud, Settings2, CheckCircle2, Save, 
  RefreshCw, Download, ArrowLeft, Image as ImageIcon 
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { CatalogPDF } from '../components/CatalogPDF';

export default function Editor() {
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('id');

  const [rawRows, setRawRows] = useState([]);
  const [columns, setColumns] = useState([]);
  const [products, setProducts] = useState([]);
  const [mapping, setMapping] = useState({ stokKodu: '', urunAdi: '', fiyat: '', resimUrl: '' });
  
  const [percentChange, setPercentChange] = useState(0);
  const [projectName, setProjectName] = useState('DZY Katalog 2026');
  const [logoUrl, setLogoUrl] = useState(''); // Logo State'i
  const [isSaving, setIsSaving] = useState(false);
  const [pdfReady, setPdfReady] = useState(false);
  const [loading, setLoading] = useState(!!projectId);

  useEffect(() => {
    if (projectId) loadProjectData();
  }, [projectId]);

  useEffect(() => {
    setPdfReady(false);
  }, [products, projectName, logoUrl]);

  // Taslağı Yükle
  const loadProjectData = async () => {
    try {
      setLoading(true);
      const { data: project } = await supabase.from('projects').select('*').eq('id', projectId).single();
      setProjectName(project.name);
      
      const { data: dbProducts } = await supabase.from('products').select('*').eq('project_id', projectId);
      setProducts(dbProducts.map(p => ({
        id: p.id, stokKodu: p.stok_kodu, urunAdi: p.urun_adi,
        fiyat: p.fiyat, resimUrl: p.resim_url, kategori: p.kategori
      })));
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  // Excel Yükleme
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      const workbook = XLSX.read(new Uint8Array(event.target.result), { type: 'array' });
      const jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
      setRawRows(jsonData);
      setColumns(Object.keys(jsonData[0]));
    };
    reader.readAsArrayBuffer(file);
  };

  // Logo Yükleme İşlemi (Base64'e çeviriyoruz ki PDF motoru kolay okusun)
  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setLogoUrl(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const confirmMapping = () => {
    setProducts(rawRows.map((item, index) => ({
      id: index,
      stokKodu: String(item[mapping.stokKodu] || ''),
      urunAdi: String(item[mapping.urunAdi] || ''),
      fiyat: parseFloat(item[mapping.fiyat]) || 0,
      resimUrl: mapping.resimUrl ? `https://images.weserv.nl/?url=${encodeURIComponent(item[mapping.resimUrl])}&w=500` : '',
      kategori: '',
    })));
  };

  const saveToDatabase = async () => {
    setIsSaving(true);
    try {
      let curId = projectId;
      if (projectId) {
        await supabase.from('projects').update({ name: projectName }).eq('id', projectId);
        await supabase.from('products').delete().eq('project_id', projectId);
      } else {
        const { data } = await supabase.from('projects').insert([{ name: projectName }]).select().single();
        curId = data.id;
      }
      await supabase.from('products').insert(products.map(p => ({
        project_id: curId, stok_kodu: p.stokKodu, urun_adi: p.urunAdi,
        fiyat: p.fiyat, resim_url: p.resimUrl, kategori: p.kategori
      })));
      alert("Taslak Kaydedildi!");
    } catch (error) { alert(error.message); } finally { setIsSaving(false); }
  };

  if (loading) return <div className="p-20 text-center animate-pulse font-bold text-blue-600">Veriler Getiriliyor...</div>;

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20">
      <Link to="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-blue-600 font-medium transition-colors">
        <ArrowLeft className="w-4 h-4" /> Katalog Listesine Dön
      </Link>

      {!projectId && products.length === 0 && rawRows.length === 0 && (
        <div className="bg-white p-16 rounded-3xl shadow-sm border border-gray-100 text-center">
          <UploadCloud className="w-20 h-20 text-blue-500 mx-auto mb-6 opacity-20" />
          <h2 className="text-3xl font-black text-gray-900 mb-4">Katalog Oluşturmaya Başla</h2>
          <label className="bg-blue-600 text-white px-10 py-4 rounded-2xl cursor-pointer hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 font-bold inline-block">
            Excel Dosyasını Seç
            <input type="file" className="hidden" accept=".xlsx, .xls" onChange={handleFileUpload} />
          </label>
        </div>
      )}

      {rawRows.length > 0 && products.length === 0 && (
        <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100 animate-in zoom-in-95 duration-300">
          <h3 className="text-2xl font-bold mb-8 text-gray-800 flex items-center gap-3">
            <Settings2 className="w-8 h-8 text-blue-600" /> Sütun Eşleştirme
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
            {['stokKodu', 'urunAdi', 'fiyat', 'resimUrl'].map((field) => (
              <div key={field} className="space-y-3">
                <label className="text-sm font-bold text-gray-500 uppercase tracking-wider">{field === 'resimUrl' ? 'Resim Linki' : field.replace(/([A-Z])/g, ' $1')}</label>
                <select className="w-full bg-gray-50 border-0 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 font-medium" value={mapping[field]} onChange={(e) => setMapping({...mapping, [field]: e.target.value})}>
                  <option value="">Sütun Seç...</option>
                  {columns.map(col => <option key={col} value={col}>{col}</option>)}
                </select>
              </div>
            ))}
          </div>
          <button onClick={confirmMapping} className="w-full bg-gray-900 text-white py-4 rounded-2xl font-black text-lg hover:bg-black transition-all shadow-xl">DÜZENLEMEYİ BAŞLAT</button>
        </div>
      )}

      {products.length > 0 && (
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 sticky top-20 z-20">
            <div className="flex flex-wrap items-end justify-between gap-8 mb-8">
              <div className="flex-1 min-w-[300px] space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden relative group">
                    {logoUrl ? <img src={logoUrl} className="w-full h-full object-contain" /> : <ImageIcon className="w-6 h-6 text-gray-300" />}
                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleLogoUpload} accept="image/*" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase">Katalog Başlığı ve Logo</h4>
                    <input type="text" value={projectName} onChange={(e) => setProjectName(e.target.value)} className="text-2xl font-black text-gray-900 outline-none w-full bg-transparent border-b-2 border-transparent focus:border-blue-500" />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase">Toplu Fiyat (%)</label>
                  <div className="flex gap-2">
                    <input type="number" value={percentChange} onChange={(e) => setPercentChange(Number(e.target.value))} className="w-20 bg-white border border-gray-200 rounded-lg px-2 py-2 text-center font-bold outline-none" />
                    <button onClick={() => {
                      setProducts(products.map(p => ({ ...p, fiyat: parseFloat((p.fiyat * (1 + percentChange / 100)).toFixed(2)) })));
                      setPercentChange(0);
                    }} className="bg-green-500 text-white px-4 rounded-lg font-bold hover:bg-green-600 transition">Uygula</button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4 justify-end items-center pt-6 border-t border-gray-50">
              <button onClick={saveToDatabase} disabled={isSaving} className="flex items-center gap-2 px-8 py-3 rounded-2xl font-bold bg-gray-100 text-gray-600 hover:bg-gray-200 transition">
                <Save className="w-5 h-5" /> {isSaving ? 'Kaydediliyor...' : 'Taslağı Kaydet'}
              </button>

              {!pdfReady ? (
                <button onClick={() => setPdfReady(true)} className="flex items-center gap-2 bg-gray-900 text-white px-10 py-4 rounded-2xl font-black shadow-2xl hover:scale-105 transition-all">
                  <RefreshCw className="w-5 h-5" /> KATALOĞU HAZIRLA
                </button>
              ) : (
                <PDFDownloadLink 
                  document={<CatalogPDF products={products} projectName={projectName} logoUrl={logoUrl} />} 
                  fileName={`${projectName.toLowerCase().replace(/\s+/g, '-')}.pdf`}
                  className="flex items-center gap-2 bg-blue-600 text-white px-10 py-4 rounded-2xl font-black shadow-2xl shadow-blue-200 animate-bounce"
                >
                  {({ loading }) => loading ? 'Oluşturuluyor...' : <><Download className="w-6 h-6" /> PDF İNDİR</>}
                </PDFDownloadLink>
              )}
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50 text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] border-b">
                  <th className="p-6">Ürün Detayı</th>
                  <th className="p-6 w-40 text-center">Birim Fiyat</th>
                  <th className="p-6 w-56">Kategori</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-blue-50/10 transition-colors">
                    <td className="p-6 flex items-center gap-8">
                      <div className="w-32 h-32 bg-white rounded-2xl border border-gray-100 shadow-sm p-2 flex-shrink-0">
                        <img src={product.resimUrl} className="w-full h-full object-contain" onError={(e) => { e.target.src = "https://via.placeholder.com/150?text=Hata"; }} />
                      </div>
                      <div className="flex-1 space-y-2">
                        <input type="text" value={product.stokKodu} onChange={(e) => setProducts(products.map(p => p.id === product.id ? {...p, stokKodu: e.target.value} : p))} className="text-xs font-bold text-blue-500 bg-blue-50 px-3 py-1 rounded-full outline-none" />
                        <input type="text" value={product.urunAdi} onChange={(e) => setProducts(products.map(p => p.id === product.id ? {...p, urunAdi: e.target.value} : p))} className="text-xl font-bold text-gray-800 bg-transparent block w-full outline-none focus:border-b border-blue-200" />
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="relative">
                        <input type="number" value={product.fiyat} onChange={(e) => setProducts(products.map(p => p.id === product.id ? {...p, fiyat: Number(e.target.value)} : p))} className="w-full bg-gray-50 border-0 rounded-xl px-4 py-3 font-black text-lg text-center outline-none focus:ring-2 focus:ring-green-100" />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-300">TL</span>
                      </div>
                    </td>
                    <td className="p-6">
                      <select value={product.kategori} onChange={(e) => setProducts(products.map(p => p.id === product.id ? {...p, kategori: e.target.value} : p))} className="w-full bg-gray-50 border-0 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500">
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