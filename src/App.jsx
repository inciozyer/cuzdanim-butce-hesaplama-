import { useState, useEffect } from 'react';
import { FaShoppingCart, FaFileInvoiceDollar, FaFilm, FaGraduationCap, FaBox, FaList, FaChartPie, FaStickyNote, FaMoon, FaSun, FaDownload, FaCalendarAlt, FaEdit, FaCheck, FaSync, FaPiggyBank, FaPlus } from 'react-icons/fa';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import './App.css';

function App() {
  const guvenliVeriOku = (anahtar, varsayilan) => {
    try {
      const kayit = localStorage.getItem(anahtar);
      return kayit ? JSON.parse(kayit) : varsayilan;
    } catch (error) {
      return varsayilan;
    }
  };

  const [toplamButce, setToplamButce] = useState(() => guvenliVeriOku('butce', 5000));
  const [harcamalar, setHarcamalar] = useState(() => guvenliVeriOku('harcamalar', []));
  const [kategoriler, setKategoriler] = useState(() => guvenliVeriOku('kategoriler', ['Market', 'Fatura', 'Eğlence', 'Eğitim', 'Diğer']));
  const [koyuTema, setKoyuTema] = useState(() => guvenliVeriOku('tema', false));
  
  // YENİ: Abonelik ve Hedef State'leri
  const [abonelikler, setAbonelikler] = useState(() => guvenliVeriOku('abonelikler', []));
  const [hedefler, setHedefler] = useState(() => guvenliVeriOku('hedefler', []));

  useEffect(() => {
    localStorage.setItem('butce', JSON.stringify(toplamButce));
    localStorage.setItem('harcamalar', JSON.stringify(harcamalar));
    localStorage.setItem('kategoriler', JSON.stringify(kategoriler));
    localStorage.setItem('tema', JSON.stringify(koyuTema)); 
    localStorage.setItem('abonelikler', JSON.stringify(abonelikler)); 
    localStorage.setItem('hedefler', JSON.stringify(hedefler)); 
    document.body.style.backgroundColor = koyuTema ? '#050c17' : '#e0f0fa';
  }, [toplamButce, harcamalar, kategoriler, koyuTema, abonelikler, hedefler]);

  const bugunTarih = new Date();
  const bugun = bugunTarih.toISOString().split('T')[0];
  const mevcutGun = bugunTarih.getDate();
  const mevcutAyYil = `${bugunTarih.getFullYear()}-${bugunTarih.getMonth() + 1}`;

  // YENİ: Otomatik Abonelik Çekim Mantığı
  useEffect(() => {
    let harcamaEklendi = false;
    const guncelAbonelikler = abonelikler.map(ab => {
      if (mevcutGun >= ab.gun && ab.sonOdeme !== mevcutAyYil) {
        setHarcamalar(prev => [...prev, {
          id: Date.now() + Math.random(),
          isim: `${ab.isim} (Otomatik)`,
          miktar: ab.miktar,
          kategori: ab.kategori,
          not: 'Aylık sabit gider otomatik ödendi',
          tarih: bugun
        }]);
        harcamaEklendi = true;
        return { ...ab, sonOdeme: mevcutAyYil };
      }
      return ab;
    });

    if (harcamaEklendi) {
      setAbonelikler(guncelAbonelikler);
    }
  }, [abonelikler, mevcutGun, mevcutAyYil, bugun]);

  // Form State'leri
  const [harcamaAdi, setHarcamaAdi] = useState('');
  const [harcamaMiktari, setHarcamaMiktari] = useState('');
  const [harcamaNotu, setHarcamaNotu] = useState('');
  const [harcamaTarihi, setHarcamaTarihi] = useState(bugun); 
  const [kategori, setKategori] = useState(kategoriler[0]);
  const [yeniKategoriAdi, setYeniKategoriAdi] = useState('');
  const [kategoriEklemeModu, setKategoriEklemeModu] = useState(false);

  const [aktifSekme, setAktifSekme] = useState('islemler'); // islemler, abonelikler, istatistikler
  const [aramaKelimesi, setAramaKelimesi] = useState('');
  const [seciliKategori, setSeciliKategori] = useState('Tümü');
  const [siralama, setSiralama] = useState('Tarih (Yeni)'); 
  const [duzenlemeModu, setDuzenlemeModu] = useState(false);
  const [geciciButce, setGeciciButce] = useState(toplamButce);

  const toplamHarcama = harcamalar.reduce((toplam, harcama) => toplam + harcama.miktar, 0);
  const kalanBakiye = toplamButce - toplamHarcama;
  
  const harcamaYuzdesi = toplamButce > 0 ? Math.min((toplamHarcama / toplamButce) * 100, 100) : 0;
  let barRengi = '#2ecc71'; 
  if (harcamaYuzdesi > 80) barRengi = '#e74c3c'; 
  else if (harcamaYuzdesi > 50) barRengi = '#f1c40f'; 

  // İşlem Fonksiyonları
  const harcamaEkle = (e) => {
    e.preventDefault();
    if (!harcamaAdi.trim() || !harcamaMiktari) return;
    const miktar = Number(harcamaMiktari);
    if (miktar <= 0) return alert("Geçerli bir miktar girin!");

    let eklenecekKat = kategori;
    if (kategoriEklemeModu) {
      if (!yeniKategoriAdi.trim()) return alert("Kategori adı boş olamaz!");
      if (!kategoriler.includes(yeniKategoriAdi.trim())) setKategoriler([...kategoriler, yeniKategoriAdi.trim()]);
      eklenecekKat = yeniKategoriAdi.trim();
    }

    setHarcamalar([...harcamalar, { id: Date.now(), isim: harcamaAdi, miktar: miktar, kategori: eklenecekKat, not: harcamaNotu.trim(), tarih: harcamaTarihi }]);
    setHarcamaAdi(''); setHarcamaMiktari(''); setHarcamaNotu(''); setHarcamaTarihi(bugun); setYeniKategoriAdi(''); setKategoriEklemeModu(false);
  };

  const harcamaSil = (id) => setHarcamalar(harcamalar.filter(h => h.id !== id));

  // YENİ: Hedef (Kumbara) Fonksiyonları
  const [hedefEkleModu, setHedefEkleModu] = useState(false);
  const [yeniHedefAd, setYeniHedefAd] = useState('');
  const [yeniHedefMiktar, setYeniHedefMiktar] = useState('');

  const hedefOlustur = (e) => {
    e.preventDefault();
    if (!yeniHedefAd || !yeniHedefMiktar) return;
    setHedefler([...hedefler, { id: Date.now(), isim: yeniHedefAd, hedefMiktar: Number(yeniHedefMiktar), biriken: 0 }]);
    setYeniHedefAd(''); setYeniHedefMiktar(''); setHedefEkleModu(false);
  };

  const hedefeParaEkle = (hedef) => {
    const miktar = Number(prompt(`'${hedef.isim}' kumbarasına kaç ₺ eklemek istiyorsun?`));
    if (miktar && miktar > 0) {
      setHedefler(hedefler.map(h => h.id === hedef.id ? { ...h, biriken: h.biriken + miktar } : h));
      setHarcamalar([...harcamalar, { id: Date.now(), isim: `Kumbaraya Aktarıldı (${hedef.isim})`, miktar: miktar, kategori: 'Diğer', not: 'Birikim', tarih: bugun }]);
    }
  };

  // YENİ: Abonelik Fonksiyonları
  const [abIsim, setAbIsim] = useState('');
  const [abMiktar, setAbMiktar] = useState('');
  const [abGun, setAbGun] = useState('');
  
  const abonelikEkle = (e) => {
    e.preventDefault();
    if (!abIsim || !abMiktar || !abGun) return;
    setAbonelikler([...abonelikler, { id: Date.now(), isim: abIsim, miktar: Number(abMiktar), kategori: 'Fatura', gun: Number(abGun), sonOdeme: '' }]);
    setAbIsim(''); setAbMiktar(''); setAbGun('');
  };

  const abonelikSil = (id) => setAbonelikler(abonelikler.filter(a => a.id !== id));

  const verileriIndir = () => {
    const basliklar = "Tarih,Isim,Kategori,Miktar,Not\n";
    const satirlar = harcamalar.map(h => `${h.tarih},${h.isim},${h.kategori},${h.miktar},${h.not || '-'}`).join("\n");
    const link = document.createElement("a");
    link.href = "data:text/csv;charset=utf-8,\uFEFF" + encodeURIComponent(basliklar + satirlar);
    link.download = `butcem_rapor_${bugun}.csv`;
    link.click();
  };

  const kategoriIkonuSec = (kat) => {
    switch (kat) {
      case 'Market': return <FaShoppingCart style={{ color: '#3498db', fontSize: '20px' }} />;
      case 'Fatura': return <FaFileInvoiceDollar style={{ color: '#e67e22', fontSize: '20px' }} />;
      case 'Eğlence': return <FaFilm style={{ color: '#9b59b6', fontSize: '20px' }} />;
      case 'Eğitim': return <FaGraduationCap style={{ color: '#2ecc71', fontSize: '20px' }} />;
      default: return <FaBox style={{ color: '#f1c40f', fontSize: '20px' }} />;
    }
  };

  const filtrelenmisVeSirali = [...harcamalar].filter(h => {
      return h.isim.toLowerCase().includes(aramaKelimesi.toLowerCase()) && (seciliKategori === 'Tümü' || h.kategori === seciliKategori);
    }).sort((a, b) => {
      if (siralama === 'Tarih (Yeni)') return new Date(b.tarih) - new Date(a.tarih) || b.id - a.id;
      if (siralama === 'Tarih (Eski)') return new Date(a.tarih) - new Date(b.tarih) || a.id - b.id;
      if (siralama === 'Tutar (Azalan)') return b.miktar - a.miktar;
      if (siralama === 'Tutar (Artan)') return a.miktar - b.miktar;
      return 0;
    });

  const renkPaleti = ['#3498db', '#e67e22', '#9b59b6', '#2ecc71', '#95a5a6', '#f1c40f', '#e74c3c', '#1abc9c'];
  const grafikVerisi = kategoriler.map((kat, i) => ({
    name: kat, value: harcamalar.filter(h => h.kategori === kat).reduce((acc, curr) => acc + curr.miktar, 0), color: renkPaleti[i % renkPaleti.length]
  })).filter(item => item.value > 0);

  return (
    <div className={`app-container ${koyuTema ? 'koyu-tema' : ''}`}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '20px 20px 10px 20px' }}>
        <h1 style={{ margin: 0, color: koyuTema ? 'white' : '#1a2c42' }}>Cüzdanım 👛</h1>
        <button onClick={() => setKoyuTema(!koyuTema)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '22px', color: koyuTema ? '#f1c40f' : '#2c3e50' }}>
          {koyuTema ? <FaSun /> : <FaMoon />}
        </button>
      </div>
      
      <div className="bakiye-karti">
        {duzenlemeModu ? (
          <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
            <input type="number" value={geciciButce} onChange={(e) => setGeciciButce(e.target.value)} className="butce-input" />
            <button onClick={() => { setToplamButce(Number(geciciButce)); setDuzenlemeModu(false); }} className="kaydet-buton"><FaCheck /> Kaydet</button>
          </div>
        ) : (
          <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '17px', opacity: 0.95 }}>Toplam Bütçe: {toplamButce} ₺</span>
            <button onClick={() => { setGeciciButce(toplamButce); setDuzenlemeModu(true); }} className="duzenle-buton"><FaEdit /> Düzenle</button>
          </div>
        )}
        <h2 style={{ color: kalanBakiye < 0 ? '#ff7675' : 'white', margin: '5px 0 15px 0', fontSize: '28px' }}>Kalan Bakiye: {kalanBakiye} ₺</h2>
        <div className="progress-container">
          <div className="progress-bar" style={{ width: `${harcamaYuzdesi}%`, backgroundColor: barRengi }}></div>
        </div>
      </div>

      {/* YENİ: YANA KAYDIRILABİLİR KUMBARA ALANI */}
      <div className="hedefler-alani">
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 20px', marginBottom: '10px' }}>
          <h3 style={{ margin: 0, color: koyuTema ? 'white' : '#1a2c42', fontSize: '15px' }}>Kumbaralarım 🎯</h3>
          <button onClick={() => setHedefEkleModu(!hedefEkleModu)} style={{ background:'none', border:'none', color: '#3498db', fontWeight:'bold', cursor:'pointer' }}>+ Yeni</button>
        </div>
        
        {hedefEkleModu && (
          <form onSubmit={hedefOlustur} style={{ padding: '0 20px', marginBottom: '15px', display: 'flex', gap: '8px' }}>
             <input className="hedef-input" style={{flex: 1}} placeholder="Örn: KPSS Lisans Hazırlık, Tatil..." value={yeniHedefAd} onChange={e=>setYeniHedefAd(e.target.value)}/>
             <input className="hedef-input" style={{width:'80px'}} type="number" placeholder="Hedef ₺" value={yeniHedefMiktar} onChange={e=>setYeniHedefMiktar(e.target.value)}/>
             <button className="kaydet-buton" type="submit" style={{padding:'0 15px'}}><FaCheck/></button>
          </form>
        )}

        <div className="hedefler-liste">
          {hedefler.map(h => (
            <div className="hedef-kart" key={h.id}>
              <h4>{h.isim}</h4>
              <div className="progress-container" style={{height:'6px', margin:'5px 0', backgroundColor:'rgba(0,0,0,0.2)'}}>
                <div className="progress-bar" style={{width: `${Math.min((h.biriken/h.hedefMiktar)*100, 100)}%`, backgroundColor: '#f1c40f'}}></div>
              </div>
              <span style={{fontSize:'12px', opacity:0.8}}>{h.biriken} / {h.hedefMiktar} ₺</span>
              <button className="hedef-buton" onClick={() => hedefeParaEkle(h)}>+ Para Ekle</button>
            </div>
          ))}
          {hedefler.length === 0 && !hedefEkleModu && <p style={{color:'#6a82a0', fontSize:'13px', margin:'0 20px'}}>Henüz birikim hedefi eklenmedi.</p>}
        </div>
      </div>

      <div className="icerik">
        
        {/* SEKME 1: İŞLEMLER */}
        {aktifSekme === 'islemler' && (
          <div className="islemler-sayfasi animasyonlu-sayfa">
            <form onSubmit={harcamaEkle}>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'stretch' }}>
                <input style={{ flex: 1, height: '48px', boxSizing: 'border-box', margin: 0, padding: '0 15px' }} type="text" placeholder="Neye harcadın?" value={harcamaAdi} onChange={(e) => setHarcamaAdi(e.target.value)} />
                <input style={{ flex: 1, height: '48px', boxSizing: 'border-box', margin: 0, padding: '0 15px' }} type="number" placeholder="Tutar (₺)" value={harcamaMiktari} onChange={(e) => setHarcamaMiktari(e.target.value)} />
              </div>
              
              <div style={{ display: 'flex', gap: '10px', alignItems: 'stretch' }}>
                <select style={{ flex: 1, height: '48px', boxSizing: 'border-box' }} value={kategoriEklemeModu ? 'YENI' : kategori} onChange={(e) => {
                    if (e.target.value === 'YENI') setKategoriEklemeModu(true);
                    else { setKategoriEklemeModu(false); setKategori(e.target.value); }
                  }}>
                  {kategoriler.map((kat) => ( <option key={kat} value={kat}>{kat}</option> ))}
                  <option value="YENI" style={{ color: '#3498db', fontWeight: 'bold' }}>+ Yeni Kategori Ekle...</option>
                </select>
                <input style={{ width: '130px', height: '48px', boxSizing: 'border-box', padding: '0 10px', color: '#6a82a0' }} type="date" value={harcamaTarihi} onChange={(e) => setHarcamaTarihi(e.target.value)} />
              </div>

              {kategoriEklemeModu && ( <input style={{ width: '100%', boxSizing: 'border-box', border: '1px solid #3498db', height: '48px', padding: '0 15px' }} type="text" placeholder="Yeni Kategori Adı" value={yeniKategoriAdi} onChange={(e) => setYeniKategoriAdi(e.target.value)} /> )}

              <input style={{ width: '100%', boxSizing: 'border-box', height: '48px', padding: '0 15px' }} type="text" placeholder="Not ekle (İsteğe bağlı)" value={harcamaNotu} onChange={(e) => setHarcamaNotu(e.target.value)} />
              <button type="submit" style={{ width: '100%', height: '48px' }}>Ekle</button>
            </form>

            <div className="liste-alani">
              <h3>İşlem Geçmişi</h3>
              {filtrelenmisVeSirali.length === 0 ? (
                <p style={{color: '#6a82a0', textAlign: 'center'}}>Kayıt bulunamadı.</p>
              ) : (
                <ul>
                  {filtrelenmisVeSirali.map((h) => (
                    <li key={h.id} className="liste-elemani">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <div style={{ backgroundColor: '#0b1a30', padding: '12px', borderRadius: '12px', display: 'flex' }}>{kategoriIkonuSec(h.kategori)}</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <span style={{ fontSize: '15px', fontWeight: 'bold' }}>{h.isim}</span>
                          <span style={{ fontSize: '12px', color: '#6a82a0' }}>{h.kategori} • <FaCalendarAlt style={{marginRight: '2px', fontSize:'10px'}}/> {h.tarih.split('-').reverse().join('.')}</span>
                          {h.not && ( <span style={{ fontSize: '11px', color: '#8e9eab', fontStyle: 'italic', display: 'flex', alignItems: 'center' }}><FaStickyNote style={{ marginRight: '5px' }} /> {h.not}</span> )}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <strong style={{ fontSize: '15px' }}>-{h.miktar} ₺</strong>
                        <button onClick={() => harcamaSil(h.id)}>Sil</button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              <div className="gelismis-filtre-alani">
                <input type="text" placeholder="Harcamalarda ara..." value={aramaKelimesi} onChange={(e) => setAramaKelimesi(e.target.value)} />
                <div style={{ display: 'flex', gap: '10px' }}>
                  <select style={{ flex: 1 }} value={seciliKategori} onChange={(e) => setSeciliKategori(e.target.value)}>
                    <option value="Tümü">Tüm Kategoriler</option>
                    {kategoriler.map((kat) => ( <option key={kat} value={kat}>{kat}</option> ))}
                  </select>
                  <select style={{ flex: 1 }} value={siralama} onChange={(e) => setSiralama(e.target.value)}>
                    <option value="Tarih (Yeni)">Tarih (En Yeni)</option>
                    <option value="Tarih (Eski)">Tarih (En Eski)</option>
                    <option value="Tutar (Azalan)">Tutar (Yüksek)</option>
                    <option value="Tutar (Artan)">Tutar (Düşük)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* YENİ SEKME 2: ABONELİKLER */}
        {aktifSekme === 'abonelikler' && (
          <div className="abonelikler-sayfasi animasyonlu-sayfa">
             <h3 style={{ borderBottom: '1px solid #162a47', paddingBottom: '15px', marginTop: '0' }}>Aylık Sabit Giderler</h3>
             <form onSubmit={abonelikEkle} style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                <input style={{ height: '48px', padding: '0 15px', borderRadius: '12px', border: 'none', backgroundColor: '#162a47', color: 'white' }} placeholder="Örn: Netflix, İnternet Faturası..." value={abIsim} onChange={e => setAbIsim(e.target.value)} />
                <div style={{ display: 'flex', gap: '10px' }}>
                   <input style={{ flex: 1, height: '48px', padding: '0 15px', borderRadius: '12px', border: 'none', backgroundColor: '#162a47', color: 'white' }} type="number" placeholder="Aylık Tutar (₺)" value={abMiktar} onChange={e => setAbMiktar(e.target.value)} />
                   <input style={{ flex: 1, height: '48px', padding: '0 15px', borderRadius: '12px', border: 'none', backgroundColor: '#162a47', color: 'white' }} type="number" min="1" max="31" placeholder="Çekim Günü (1-31)" value={abGun} onChange={e => setAbGun(e.target.value)} />
                </div>
                <button type="submit" style={{ height: '48px', backgroundColor: '#9b59b6', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold' }}>Otomatik Çekimi Başlat</button>
             </form>
             
             <ul>
               {abonelikler.map(ab => (
                 <li key={ab.id} className="liste-elemani">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ fontSize: '15px', fontWeight: 'bold' }}>{ab.isim}</span>
                      <span style={{ fontSize: '12px', color: '#6a82a0' }}>Her ayın {ab.gun}. günü çekilecek</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                      <strong style={{ fontSize: '15px', color: '#e74c3c' }}>{ab.miktar} ₺</strong>
                      <button onClick={() => abonelikSil(ab.id)}>İptal</button>
                    </div>
                 </li>
               ))}
               {abonelikler.length === 0 && <p style={{color: '#6a82a0', textAlign: 'center'}}>Aktif sabit ödemeniz bulunmuyor.</p>}
             </ul>
          </div>
        )}

        {/* SEKME 3: İSTATİSTİKLER */}
        {aktifSekme === 'istatistikler' && (
          <div className="istatistik-sayfasi animasyonlu-sayfa">
            <h3 style={{ borderBottom: '1px solid #162a47', paddingBottom: '15px', marginTop: '0' }}>Kategori Dağılımı</h3>
            {grafikVerisi.length > 0 ? (
              <>
                <div className="grafik-alani" style={{ height: '230px', marginBottom: '20px' }}>
                  <ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={grafikVerisi} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5}>{grafikVerisi.map((entry, index) => ( <Cell key={`cell-${index}`} fill={entry.color} /> ))}</Pie><Tooltip /></PieChart></ResponsiveContainer>
                </div>
                <ul style={{ marginTop: '10px', overflowY: 'auto', maxHeight: '150px' }}>
                  {grafikVerisi.map((kat, index) => (
                    <li key={index} className="liste-elemani" style={{ justifyContent: 'flex-start', gap: '15px', padding: '10px 0' }}>
                       <div style={{ width: '15px', height: '15px', backgroundColor: kat.color, borderRadius: '50%' }}></div>
                       <span style={{ flex: 1, fontSize: '15px' }}>{kat.name}</span>
                       <strong>{kat.value} ₺</strong>
                    </li>
                  ))}
                </ul>
              </>
            ) : ( <p style={{color: '#6a82a0', textAlign: 'center'}}>Grafik için henüz harcama yok.</p> )}
            <button onClick={verileriIndir} className="excel-buton"><FaDownload /> Verileri Excel (CSV) İndir</button>
          </div>
        )}
      </div>

      <div className="alt-menu">
        <button className={aktifSekme === 'islemler' ? 'aktif' : ''} onClick={() => setAktifSekme('islemler')}>
          <FaList className="ikon" /> İşlemler
        </button>
        <button className={aktifSekme === 'abonelikler' ? 'aktif' : ''} onClick={() => setAktifSekme('abonelikler')}>
          <FaSync className="ikon" /> Sabit Gider
        </button>
        <button className={aktifSekme === 'istatistikler' ? 'aktif' : ''} onClick={() => setAktifSekme('istatistikler')}>
          <FaChartPie className="ikon" /> İstatistikler
        </button>
      </div>
    </div>
  );
}

export default App;