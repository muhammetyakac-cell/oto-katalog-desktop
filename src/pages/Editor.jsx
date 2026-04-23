import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { 
  UploadCloud, Settings2, CheckCircle2, Save, 
  RefreshCw, Download, ArrowLeft, Image as ImageIcon,
  Edit2, ArrowLeftRight, Trash2, PlusCircle, X
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
  
  // YENİ: Ekstra Özel Alan State'i
  const [customFieldsMapping, setCustomFieldsMapping] = useState([]); 
  
  const [percentChange, setPercentChange] = useState(0);
  const [projectName, setProjectName] = useState('Yeni Katalog');
  const [logoUrl, setLogoUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [pdfReady, setPdfReady] = useState(false);
  const [loading, setLoading] = useState(!!projectId);

  const [editingImageId, setEditingImageId] = useState(null);
  const [tempImageUrl, setTempImageUrl] = useState('');
  const [swap1, setSwap1] = useState('');
  const [swap2, setSwap2] = useState('');

  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkCategory, setBulkCategory] = useState('');
  const [lastSelectedIndex, setLastSelectedIndex] = useState(null);

  useEffect(() => {
    if (projectId) {
      const loadData = async () => {
        try {
          setLoading(true);
          const { data: project } = await supabase.from('projects').select('*').eq('id', projectId).single();
          if (project) setProjectName(project.name);
          
          const { data: dbProducts } = await supabase.from('products').select('*').eq('project_id', projectId);
          if (dbProducts) {
            setProducts(dbProducts.map(p => ({
              id: p.id, 
              stokKodu: p.stok_kodu, 
              urunAdi: p.urun_adi,
              fiyat: p.fiyat, 
              resimUrl: p.resim_url, 
              kategori: p.kategori,
              ekstraOzellikler: p.ekstra_ozellikler || {} // DB'den JSONB'yi çekiyoruz
            })));
          }
        } catch (error) { console.error(error); } finally { setLoading(false); }
      };
      loadData();
    }
  }, [projectId]);

  useEffect(() => {
    setPdfReady(false);
  }, [products, projectName, logoUrl]);

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

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setLogoUrl(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const confirmMapping = () => {
    setProducts(rawRows.map((item, index) => {
      // Ekstra özellikleri objeye dönüştürüyoruz
      const ekstraObj = {};
      customFieldsMapping.forEach(cf => {
        if (cf.name && cf.col) ekstraObj[cf.name] = String(item[cf.col] || '');
      });

      return {
        id: index,
        stokKodu: String(item[mapping.stokKodu] || ''),
        urunAdi: String(item[mapping.urunAdi] || ''),
        fiyat: parseFloat(item[mapping.fiyat]) || 0,
        resimUrl: mapping.resimUrl ? `https://images.weserv.nl/?url=${encodeURIComponent(item[mapping.resimUrl])}&w=500` : '',
        kategori: '',
        ekstraOzellikler: ekstraObj
      };
    }));
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
      
      const insertData = products.map(p => ({
        project_id: curId, stok_kodu: p.stokKodu, urun_adi: p.urunAdi,
        fiyat: p.fiyat, resim_url: p.resimUrl, kategori: p.kategori,
        ekstra_ozellikler: p.ekstraOzellikler // Supabase'e JSONB olarak gidiyor
      }));

      await supabase.from('products').insert(insertData);
      alert("Katalog Başarıyla Kaydedildi!");
    } catch (error) { alert(error.message); } finally { setIsSaving(false); }
  };

  const handleSwap = () => {
    const idx1 = parseInt(swap1) - 1;
    const idx2 = parseInt(swap2) - 1;
    if (isNaN(idx1) || isNaN(idx2) || idx1 < 0 || idx2 < 0 || idx1 >= products.length || idx2 >= products.length) {
      alert('Lütfen geçerli satır numaraları girin!'); return;
    }
    const newProducts = [...products];
    const temp = newProducts[idx1];
    newProducts[idx1] = newProducts[idx2];
    newProducts[idx2] = temp;
    setProducts(newProducts);
    setSwap1(''); setSwap2('');
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) setSelectedIds(products.map(p => p.id));
    else setSelectedIds([]);
  };

  const handleSelectOne = (e, id, currentIndex) => {
    if (e.nativeEvent.shiftKey && lastSelectedIndex !== null) {
      const start = Math.min(lastSelectedIndex, currentIndex);
      const end = Math.max(lastSelectedIndex, currentIndex);
      const rangeIds = products.slice(start, end + 1).map(p => p.id);
      if (e.target.checked) {
        setSelectedIds(prev => [...new Set([...prev, ...rangeIds])]);
      } else {
        setSelectedIds(prev => prev.filter(x => !rangeIds.includes(x)));
      }
    } else {
      if (selectedIds.includes(id)) setSelectedIds(prev => prev.filter(x => x !== id));
      else setSelectedIds(prev => [...prev, id]);
    }
    setLastSelectedIndex(currentIndex);
  };

  const handleApplyBulkCategory = () => {
    if (!bulkCategory) return;
    if (selectedIds.length > 0) {
      setProducts(products.map(p => selectedIds.includes(p.id) ? { ...p, kategori: bulkCategory } : p));
    } else {
      setProducts(products.map(p => ({ ...p, kategori: bulkCategory })));
    }
  };

  const handleDeleteSelected = () => {
    if (!confirm(`${selectedIds.length} adet ürünü silmek istediğinize emin misiniz?`)) return;
    setProducts(products.filter(p => !selectedIds.includes(p.id)));
    setSelectedIds([]); setLastSelectedIndex(null);
  };

  if (loading) return <div className="p-20 text-center font-bold text-blue-600">Taslak Yükleniyor...</div>;

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20 px-4">
      
      <Link to="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-600 font-medium transition-colors">
        <ArrowLeft className="w-4 h-4" /> Katalog Listesine Dön
      </Link>

      {!projectId && products.length === 0 && rawRows.length === 0 && (
        <div className="bg-white p-12 rounded-3xl shadow-sm border border-gray-100 text-center">
          <UploadCloud className="w-16 h-16 text-blue-500 mx-auto mb-4 opacity-30" />
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Katalog Oluşturmak İçin Excel Yükle</h2>
          <label className="bg-blue-600 text-white px-8 py-3 rounded-xl cursor-pointer hover:bg-blue-700 transition shadow-lg font-bold">
            Excel Dosyasını Seç
            <input type="file" className="hidden" accept=".xlsx, .xls" onChange={handleFileUpload} />
          </label>
        </div>
      )}

      {rawRows.length > 0 && products.length === 0 && (
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Settings2 className="w-6 h-6 text-blue-600" /> Sütunları Eşleştirin
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {['stokKodu', 'urunAdi', 'fiyat', 'resimUrl'].map((field) => (
              <div key={field} className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">{field === 'resimUrl' ? 'Resim Linki' : field.replace(/([A-Z])/g, ' $1')}</label>
                <select className="w-full bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" value={mapping[field]} onChange={(e) => setMapping({...mapping, [field]: e.target.value})}>
                  <option value="">Seçiniz...</option>
                  {columns.map(col => <option key={col} value={col}>{col}</option>)}
                </select>
              </div>
            ))}
          </div>

          {/* YENİ: Ekstra Alan Ekleme Arayüzü */}
          <div className="mb-8 p-4 bg-gray-50 rounded-xl border border-dashed border-gray-300">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-bold text-gray-600">Özel Alanlar (Maksimum 3)</h4>
              {customFieldsMapping.length < 3 && (
                <button onClick={() => setCustomFieldsMapping([...customFieldsMapping, { name: '', col: '' }])} className="text-xs flex items-center gap-1 bg-blue-100 text-blue-600 px-3 py-1.5 rounded-lg font-bold hover:bg-blue-200 transition">
                  <PlusCircle className="w-4 h-4" /> Yeni Ekle
                </button>
              )}
            </div>
            <div className="space-y-3">
              {customFieldsMapping.map((cf, idx) => (
                <div key={idx} className="flex gap-4 items-center">
                  <input type="text" placeholder="Alan Adı (Örn: Marka)" value={cf.name} onChange={(e) => {
                    const newCfm = [...customFieldsMapping];
                    newCfm[idx].name = e.target.value;
                    setCustomFieldsMapping(newCfm);
                  }} className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                  <select value={cf.col} onChange={(e) => {
                    const newCfm = [...customFieldsMapping];
                    newCfm[idx].col = e.target.value;
                    setCustomFieldsMapping(newCfm);
                  }} className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">Sütun Seçiniz...</option>
                    {columns.map(col => <option key={col} value={col}>{col}</option>)}
                  </select>
                  <button onClick={() => setCustomFieldsMapping(customFieldsMapping.filter((_, i) => i !== idx))} className="text-red-400 hover:text-red-600 p-2">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ))}
              {customFieldsMapping.length === 0 && <p className="text-xs text-gray-400 italic">PDF kartında çıkmasını istediğiniz (Örn: Boyut, Garanti, Uyum) gibi ekstra alanlar ekleyebilirsiniz.</p>}
            </div>
          </div>

          <button onClick={confirmMapping} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition">DÜZENLEMEYİ BAŞLAT</button>
        </div>
      )}

      {products.length > 0 && (
        <div className="space-y-6 relative">
          
          <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 mb-8">
            <div className="flex flex-wrap items-end justify-between gap-6 mb-8">
              
              <div className="flex items-center gap-6 flex-1 min-w-[300px]">
                <div className="w-20 h-20 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden shadow-inner shrink-0">
                  {logoUrl ? <img src={logoUrl} className="w-full h-full object-contain" /> : <ImageIcon className="w-8 h-8 text-gray-300" />}
                </div>

                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-3">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Kurumsal Logo</h4>
                    <label className="flex items-center gap-2 px-3 py-1 bg-white border border-gray-200 rounded-lg text-[11px] font-bold text-blue-600 cursor-pointer hover:bg-blue-50 transition-all shadow-sm">
                      <UploadCloud className="w-3 h-3" /> LOGO YÜKLE
                      <input type="file" className="hidden" onChange={handleLogoUpload} accept="image/*" />
                    </label>
                    {logoUrl && <button onClick={() => setLogoUrl('')} className="text-[10px] text-red-500 font-bold hover:underline">KALDIR</button>}
                  </div>
                  <input type="text" value={projectName} onChange={(e) => setProjectName(e.target.value)} placeholder="Katalog Başlığı..." className="text-2xl font-black text-gray-900 outline-none w-full bg-transparent border-b-2 border-gray-100 focus:border-blue-500" />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase">Toplu Fiyat (%)</label>
                  <div className="flex gap-2">
                    <input type="number" value={percentChange} onChange={(e) => setPercentChange(Number(e.target.value))} className="w-16 bg-white border border-gray-200 rounded-lg px-2 py-2 text-center font-bold outline-none" />
                    <button onClick={() => {
                      setProducts(products.map(p => ({ ...p, fiyat: parseFloat((p.fiyat * (1 + percentChange / 100)).toFixed(2)) })));
                      setPercentChange(0);
                    }} className="bg-green-500 text-white px-3 rounded-lg font-bold hover:bg-green-600 transition">Uygula</button>
                  </div>
                </div>

                <div className="space-y-1 border-l border-gray-200 pl-4">
                  <label className="text-[10px] font-black text-blue-500 uppercase">{selectedIds.length > 0 ? `Seçililere Kategori (${selectedIds.length})` : 'Tümüne Kategori'}</label>
                  <div className="flex gap-2">
                    <select value={bulkCategory} onChange={(e) => setBulkCategory(e.target.value)} className="w-32 bg-white border border-gray-200 rounded-lg px-2 py-2 text-sm font-bold outline-none">
                      <option value="">Seçiniz...</option>
                      <option value="Egzoz Ucu">Egzoz Ucu</option>
                      <option value="Varex">Varex</option>
                      <option value="Downpipe">Downpipe</option>
                      <option value="OEM Susturucu">OEM Susturucu</option>
                    </select>
                    <button onClick={handleApplyBulkCategory} className="bg-blue-600 text-white px-3 rounded-lg font-bold hover:bg-blue-700 transition">Uygula</button>
                  </div>
                </div>

                {selectedIds.length > 0 && (
                  <div className="space-y-1 border-l border-gray-200 pl-4">
                    <label className="text-[10px] font-black text-red-500 uppercase tracking-wider">Silme İşlemi</label>
                    <button onClick={handleDeleteSelected} className="bg-red-500 text-white px-4 py-2 rounded-lg font-bold hover:bg-red-600 transition flex items-center gap-1 h-[38px]">
                      <Trash2 className="w-4 h-4" /> SİL
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-4 justify-end items-center pt-6 border-t border-gray-100">
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
                  className="flex items-center gap-2 bg-blue-600 text-white px-10 py-4 rounded-2xl font-black shadow-2xl animate-bounce"
                >
                  {({ loading }) => loading ? 'Oluşturuluyor...' : <><Download className="w-6 h-6" /> PDF İNDİR</>}
                </PDFDownloadLink>
              )}
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50 text-gray-400 text-[10px] font-black uppercase tracking-widest border-b">
                  <th className="p-6 w-16 text-center">
                    <input type="checkbox" className="w-4 h-4 cursor-pointer accent-blue-600" onChange={handleSelectAll} checked={products.length > 0 && selectedIds.length === products.length} />
                  </th>
                  <th className="p-6">Sıra & Ürün Detayı</th>
                  <th className="p-6 w-40 text-center">Birim Fiyat</th>
                  <th className="p-6 w-56">Kategori</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {products.map((product, index) => (
                  <tr key={product.id} className={`transition-colors ${selectedIds.includes(product.id) ? 'bg-blue-50/40' : 'hover:bg-blue-50/5'}`}>
                    
                    <td className="p-6 text-center">
                      <input type="checkbox" className="w-4 h-4 cursor-pointer accent-blue-600" checked={selectedIds.includes(product.id)} onChange={(e) => handleSelectOne(e, product.id, index)} />
                    </td>

                    <td className="p-6 flex items-center gap-6">
                      <span className="font-black text-gray-200 text-2xl w-8 text-right">#{index + 1}</span>

                      <div className="flex flex-col items-center gap-2">
                        <div className="w-32 h-32 bg-white rounded-2xl border border-gray-100 shadow-sm p-2 flex-shrink-0">
                          <img src={product.resimUrl} className="w-full h-full object-contain" onError={(e) => { e.target.src = "https://via.placeholder.com/150?text=Hata"; }} />
                        </div>
                        
                        {editingImageId === product.id ? (
                          <div className="flex flex-col gap-1 w-32">
                            <input type="text" value={tempImageUrl} onChange={(e) => setTempImageUrl(e.target.value)} placeholder="Yeni Link..." className="text-[10px] px-2 py-1.5 border border-blue-200 rounded-md bg-blue-50 outline-none w-full font-medium"/>
                            <div className="flex gap-1 w-full">
                              <button onClick={() => {
                                const finalUrl = tempImageUrl ? `https://images.weserv.nl/?url=${encodeURIComponent(tempImageUrl)}&w=500` : '';
                                setProducts(products.map(p => p.id === product.id ? {...p, resimUrl: finalUrl} : p));
                                setEditingImageId(null);
                              }} className="text-[10px] font-bold bg-green-500 text-white px-2 py-1 rounded-md flex-1 hover:bg-green-600">Güncelle</button>
                              <button onClick={() => setEditingImageId(null)} className="text-[10px] font-bold bg-gray-200 text-gray-600 px-2 py-1 rounded-md hover:bg-gray-300">İptal</button>
                            </div>
                          </div>
                        ) : (
                          <button onClick={() => { setEditingImageId(product.id); setTempImageUrl(''); }} className="text-[10px] font-bold text-blue-500 hover:text-blue-700 flex items-center gap-1 bg-blue-50 px-3 py-1.5 rounded-full transition">
                            <Edit2 className="w-3 h-3" /> Foto Değiştir
                          </button>
                        )}
                      </div>

                      <div className="flex-1 space-y-2">
                        <input type="text" value={product.stokKodu} onChange={(e) => setProducts(products.map(p => p.id === product.id ? {...p, stokKodu: e.target.value} : p))} className="text-xs font-bold text-blue-500 bg-blue-50 px-3 py-1 rounded-full outline-none" />
                        <input type="text" value={product.urunAdi} onChange={(e) => setProducts(products.map(p => p.id === product.id ? {...p, urunAdi: e.target.value} : p))} className="text-xl font-bold text-gray-800 bg-transparent block w-full outline-none border-b border-transparent focus:border-blue-200" />
                        
                        {/* YENİ: Editör İçindeki Ekstra Alan Girişleri */}
                        {product.ekstraOzellikler && Object.keys(product.ekstraOzellikler).length > 0 && (
                          <div className="flex flex-wrap gap-2 pt-2">
                            {Object.entries(product.ekstraOzellikler).map(([key, val], idx) => (
                              <div key={idx} className="flex items-center bg-gray-50 border border-gray-200 rounded px-2 py-1">
                                <span className="text-[10px] font-bold text-gray-500 mr-2">{key}:</span>
                                <input 
                                  type="text" 
                                  value={val} 
                                  onChange={(e) => {
                                    setProducts(products.map(p => p.id === product.id ? {
                                      ...p, ekstraOzellikler: { ...p.ekstraOzellikler, [key]: e.target.value }
                                    } : p));
                                  }}
                                  className="text-[11px] font-semibold bg-transparent outline-none w-20 text-gray-700" 
                                />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-6 text-center">
                      <input type="number" value={product.fiyat} onChange={(e) => setProducts(products.map(p => p.id === product.id ? {...p, fiyat: Number(e.target.value)} : p))} className="w-full bg-gray-50 border-0 rounded-xl px-4 py-3 font-black text-lg text-center outline-none" />
                    </td>
                    <td className="p-6">
                      <select value={product.kategori} onChange={(e) => setProducts(products.map(p => p.id === product.id ? {...p, kategori: e.target.value} : p))} className="w-full bg-gray-50 border-0 rounded-xl px-4 py-3 text-sm font-bold outline-none">
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

          <div className="fixed bottom-8 right-8 bg-white/95 backdrop-blur-md p-5 rounded-3xl shadow-2xl border border-gray-100 flex flex-col gap-3 z-50">
            <div className="flex items-center gap-2 mb-1">
              <ArrowLeftRight className="w-4 h-4 text-blue-600" />
              <h4 className="text-xs font-black text-gray-700 uppercase tracking-widest">Sıralama Değiştir</h4>
            </div>
            <div className="flex items-center gap-3">
              <input type="number" value={swap1} onChange={(e) => setSwap1(e.target.value)} placeholder="Satır" className="w-16 border-2 border-gray-100 rounded-xl px-2 py-2 text-sm font-bold text-center outline-none focus:border-blue-500" />
              <span className="text-xs font-bold text-gray-400 uppercase">ile</span>
              <input type="number" value={swap2} onChange={(e) => setSwap2(e.target.value)} placeholder="Satır" className="w-16 border-2 border-gray-100 rounded-xl px-2 py-2 text-sm font-bold text-center outline-none focus:border-blue-500" />
              <button onClick={handleSwap} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-xs font-black transition-colors">DEĞİŞTİR</button>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}