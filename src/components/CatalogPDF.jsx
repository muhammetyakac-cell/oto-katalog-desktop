import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image, Font } from '@react-pdf/renderer';

// Türkçe karakter desteği için stabil Roboto fontları
Font.register({
  family: 'Roboto',
  fonts: [
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/fonts/Roboto/Roboto-Regular.ttf', fontWeight: 'normal' },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/fonts/Roboto/Roboto-Medium.ttf', fontWeight: 'bold' },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/fonts/Roboto/Roboto-Italic.ttf', fontStyle: 'italic' }
  ]
});

const styles = StyleSheet.create({
  page: { 
    paddingTop: 30, 
    paddingBottom: 35, // Tam 1.2 cm civarına denk gelir
    paddingHorizontal: 35,
    backgroundColor: '#ffffff', 
    fontFamily: 'Roboto' 
  },
  
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 20, 
    borderBottomWidth: 2,
    borderBottomColor: '#f3f4f6',
    borderBottomStyle: 'solid',
    paddingBottom: 10,
    height: 70 
  },
  logo: { width: 100, height: 50, objectFit: 'contain' },
  logoPlaceholder: { width: 100, height: 50 },
  catalogTitle: { fontSize: 16, fontWeight: 'bold', color: '#111827', textTransform: 'uppercase' },
  
  gridContainer: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    justifyContent: 'space-between'
  },
  
  // Kutucuk yüksekliği milimetrik hesaplandı. (242 * 3) + boşluklar = A4'e kusursuz oturur.
  productCard: {
    width: '49%', 
    height: 242, 
    marginBottom: 15, 
    padding: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0', 
    borderStyle: 'solid',
    borderRadius: 10,
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: '#ffffff'
  },
  
  imageContainer: {
    height: 85,
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6 
  },
  image: { width: 85, height: 85, objectFit: 'contain' },
  
  contentBox: { 
    width: '100%', 
    alignItems: 'center',
    flex: 1
  },
  
  title: { 
    fontSize: 10, 
    fontWeight: 'bold', 
    textAlign: 'center', 
    color: '#1e3a8a', 
    marginBottom: 3,
    maxLines: 2, 
    textOverflow: 'ellipsis'
  },

  // 3. Ekstra Sütun için ürün adı altı özel alan
  topExtraText: {
    fontSize: 7.5,
    color: '#475569',
    textAlign: 'center',
    marginBottom: 3,
    paddingHorizontal: 4,
    lineHeight: 1.2
  },
  
  code: { 
    fontSize: 8, 
    color: '#64748b', 
    marginBottom: 4, 
    fontStyle: 'italic' 
  },
  
  categoryBadge: {
    backgroundColor: '#e0f2fe',
    color: '#0284c7',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 8,
    fontSize: 7,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginBottom: 5
  },

  // Alt kısımda kalacak maksimum 2 ekstra alan için
  bottomFieldsContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginBottom: 4
  },
  customFieldRow: {
    width: '100%',
    marginBottom: 2
  },
  customFieldText: {
    fontSize: 7,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 1.2
  },
  customFieldLabel: {
    fontWeight: 'bold',
    color: '#0f172a'
  },
  
  priceContainer: { 
    backgroundColor: '#10b981', 
    paddingVertical: 5,
    paddingHorizontal: 20, 
    borderRadius: 6, 
    alignItems: 'center',
    marginTop: 'auto', 
  },
  price: { 
    fontSize: 12, 
    fontWeight: 'bold', 
    color: '#ffffff' 
  },
  
  pageNumber: {
    position: 'absolute',
    fontSize: 8,
    bottom: 12,
    left: 0,
    right: 0,
    textAlign: 'center',
    color: '#9ca3af',
  },
});

const ProductCard = ({ product }) => {
  // Ekstra özellikleri filtreleyip diziye çeviriyoruz
  const extras = Object.entries(product.ekstraOzellikler || {}).filter(([key, val]) => val);
  
  // 3. Özellik (Eğer varsa)
  const topExtra = extras.length > 2 ? extras[2] : null;
  // İlk 2 Özellik
  const bottomExtras = extras.length > 2 ? extras.slice(0, 2) : extras;

  return (
    <View style={styles.productCard} wrap={false}>
      <View style={styles.imageContainer}>
        {product.resimUrl && (
          <Image src={product.resimUrl} style={styles.image} />
        )}
      </View>
      
      <View style={styles.contentBox}>
        {/* 1. Ürün Adı */}
        <Text style={styles.title} maxLines={2} textOverflow="ellipsis">
          {product.urunAdi}
        </Text>
        
        {/* 2. (YENİ) 3. Ekstra Alan Ürün Adının Hemen Altında */}
        {topExtra && (
          <Text style={styles.topExtraText} maxLines={2} textOverflow="ellipsis">
            <Text style={{ fontWeight: 'bold', color: '#0f172a' }}>{topExtra[0]}: </Text>
            {topExtra[1]}
          </Text>
        )}
        
        {/* 3. Stok Kodu */}
        <Text style={styles.code}>{product.stokKodu}</Text>
        
        {/* 4. Kategori */}
        {product.kategori ? (
          <Text style={styles.categoryBadge}>{product.kategori}</Text>
        ) : null}

        {/* 5. İlk 2 Ekstra Alan (Alt Kısımda) */}
        <View style={styles.bottomFieldsContainer}>
          {bottomExtras.map(([key, val], idx) => (
            <View key={idx} style={styles.customFieldRow}>
              <Text style={styles.customFieldText} maxLines={1} textOverflow="ellipsis">
                <Text style={styles.customFieldLabel}>{key}: </Text>
                {val}
              </Text>
            </View>
          ))}
        </View>

        {/* 6. Fiyat (Her Zaman En Altta) */}
        <View style={styles.priceContainer}>
          <Text style={styles.price}>{product.fiyat} TL</Text>
        </View>
      </View>
    </View>
  );
};

export const CatalogPDF = ({ products, projectName, logoUrl }) => {
  const firstPageProducts = products.slice(0, 4);
  const remainingProducts = products.slice(4);
  const otherPages = [];
  
  for (let i = 0; i < remainingProducts.length; i += 6) {
    otherPages.push(remainingProducts.slice(i, i + 6));
  }

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          {logoUrl ? <Image src={logoUrl} style={styles.logo} /> : <View style={styles.logoPlaceholder} />}
          <Text style={styles.catalogTitle}>{projectName}</Text>
        </View>

        <View style={styles.gridContainer}>
          {firstPageProducts.map((product, index) => (
            <ProductCard key={product.id || index} product={product} />
          ))}
        </View>
        <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} fixed />
      </Page>

      {otherPages.map((pageGroup, pageIndex) => (
        <Page key={pageIndex} size="A4" style={styles.page}>
          <View style={styles.gridContainer}>
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