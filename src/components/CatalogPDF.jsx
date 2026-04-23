import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { padding: 40, backgroundColor: '#ffffff' },
  
  // İlk sayfa için başlık alanı
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 30, 
    borderBottom: '2pt solid #f3f4f6', 
    paddingBottom: 10,
    height: 80 // Sabit yükseklik
  },
  logo: { width: 110, height: 60, objectFit: 'contain' },
  catalogTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827', textTransform: 'uppercase' },
  
  // Izgara Düzeni
  gridContainer: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    justifyContent: 'space-between' 
  },
  
  // Ürün Kartı (Sabit Boyutlu - Asla Kesilmez)
  productCard: {
    width: '48%', // 2 Sütun
    height: 230, // 3 satırın A4'e tam sığması için hesaplanmış ideal yükseklik
    marginBottom: 20,
    padding: 12,
    border: '1pt solid #f3f4f6',
    borderRadius: 8,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between' // İçeriği eşit dağıtır, fiyat hep en altta kalır
  },
  
  // Görsel Alanı
  imageContainer: {
    height: 110,
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8
  },
  image: { width: 110, height: 110, objectFit: 'contain' },
  
  // Metin Alanı
  contentBox: { width: '100%', alignItems: 'center' },
  title: { 
    fontSize: 11, 
    fontWeight: 'bold', 
    textAlign: 'center', 
    color: '#1f2937', 
    marginBottom: 4,
    height: 28 // Uzun isimler aşağıyı ittirmesin diye sabit yükseklik
  },
  code: { fontSize: 8, color: '#6b7280', marginBottom: 8, fontStyle: 'italic' },
  
  // Fiyat Alanı
  priceContainer: { 
    backgroundColor: '#f9fafb', 
    padding: '6 16', 
    borderRadius: 4, 
    width: '100%',
    alignItems: 'center'
  },
  price: { fontSize: 13, fontWeight: 'heavy', color: '#111827' },
  
  // Sayfa Numarası
  pageNumber: {
    position: 'absolute',
    fontSize: 10,
    bottom: 20,
    left: 0,
    right: 0,
    textAlign: 'center',
    color: '#9ca3af',
  },
});

// Tekil Ürün Kartı Bileşeni (Kodu temiz tutmak için)
const ProductCard = ({ product }) => (
  <View style={styles.productCard} wrap={false}>
    <View style={styles.imageContainer}>
      {product.resimUrl && (
        <Image src={product.resimUrl} style={styles.image} />
      )}
    </View>
    <View style={styles.contentBox}>
      <Text style={styles.title}>{product.urunAdi}</Text>
      <Text style={styles.code}>{product.stokKodu}</Text>
      <View style={styles.priceContainer}>
        <Text style={styles.price}>{product.fiyat} TL</Text>
      </View>
    </View>
  </View>
);

export const CatalogPDF = ({ products, projectName, logoUrl }) => {
  // MATEMATİKSEL BÖLME İŞLEMİ (CHUNKING)
  // 1. İlk sayfaya sadece ilk 4 ürünü alıyoruz (Çünkü Logo/Başlık yer kaplıyor)
  const firstPageProducts = products.slice(0, 4);
  
  // 2. Geriye kalan ürünleri ayırıyoruz
  const remainingProducts = products.slice(4);
  
  // 3. Geri kalanları tam 6'şarlı gruplara bölüyoruz
  const otherPages = [];
  for (let i = 0; i < remainingProducts.length; i += 6) {
    otherPages.push(remainingProducts.slice(i, i + 6));
  }

  return (
    <Document>
      {/* İLK SAYFA: Başlık + 4 Ürün */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          {logoUrl ? (
            <Image src={logoUrl} style={styles.logo} />
          ) : (
            <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#3b82f6' }}>DZY Katalog</Text>
          )}
          <Text style={styles.catalogTitle}>{projectName}</Text>
        </View>

        <View style={styles.gridContainer}>
          {firstPageProducts.map((product, index) => (
            <ProductCard key={product.id || index} product={product} />
          ))}
        </View>
        
        <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} fixed />
      </Page>

      {/* DİĞER SAYFALAR: Sadece 6 Ürün (Başlık Yok) */}
      {otherPages.map((pageGroup, pageIndex) => (
        <Page key={pageIndex} size="A4" style={styles.page}>
          <View style={[styles.gridContainer, { marginTop: 10 }]}>
            {pageGroup.map((product, index) => (
              <ProductCard key={product.id || index} product={product} />
            ))}
          </View>
          
          <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} fixed />
        </Page>
      ))}
    </Document>
  );
};