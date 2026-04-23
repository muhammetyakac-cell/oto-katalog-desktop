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
    paddingTop: 40, 
    paddingBottom: 30, 
    paddingHorizontal: 40,
    backgroundColor: '#ffffff', 
    fontFamily: 'Roboto' 
  },
  
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 25, 
    borderBottomWidth: 2,
    borderBottomColor: '#f3f4f6',
    borderBottomStyle: 'solid',
    paddingBottom: 10,
    height: 80 
  },
  logo: { width: 110, height: 60, objectFit: 'contain' },
  logoPlaceholder: { width: 110, height: 60 },
  catalogTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827', textTransform: 'uppercase' },
  
  gridContainer: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    justifyContent: 'space-between'
  },
  
  productCard: {
    width: '48%', 
    height: 245, // A4 sayfasına 3 adet sığabilecek maksimum yüksekliğe çıkarıldı
    marginBottom: 15, 
    padding: 10, // İç boşluk daraltılarak metinlere alan açıldı
    borderWidth: 1,
    borderColor: '#e2e8f0', 
    borderStyle: 'solid',
    borderRadius: 12, 
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: '#ffffff'
  },
  
  imageContainer: {
    height: 85, // Metinlere yer açmak için optimize edildi
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
    flex: 1, 
    display: 'flex',
    flexDirection: 'column'
  },
  
  title: { 
    fontSize: 11, 
    fontWeight: 'bold', 
    textAlign: 'center', 
    color: '#1e3a8a', 
    marginBottom: 2,
    maxLines: 2, 
    textOverflow: 'ellipsis' 
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
    borderRadius: 10,
    fontSize: 7,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginBottom: 6
  },

  customFieldsContainer: {
    width: '100%',
    flex: 1, 
    alignItems: 'center',
    justifyContent: 'flex-start',
    overflow: 'hidden',
    marginBottom: 6
  },
  // Üst üste binmeyi engellemek için her özelliği kendi View kutusuna alıyoruz
  customFieldRow: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 3
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
    borderRadius: 8, 
    alignItems: 'center',
    marginTop: 'auto', // En dibe yaslar
  },
  price: { 
    fontSize: 13, 
    fontWeight: 'bold', 
    color: '#ffffff' 
  },
  
  pageNumber: {
    position: 'absolute',
    fontSize: 9,
    bottom: 15,
    left: 0,
    right: 0,
    textAlign: 'center',
    color: '#9ca3af',
  },
});

const ProductCard = ({ product }) => (
  <View style={styles.productCard} wrap={false}>
    <View style={styles.imageContainer}>
      {product.resimUrl && (
        <Image src={product.resimUrl} style={styles.image} />
      )}
    </View>
    <View style={styles.contentBox}>
      <Text style={styles.title} maxLines={2} textOverflow="ellipsis">
        {product.urunAdi}
      </Text>
      
      <Text style={styles.code}>{product.stokKodu}</Text>
      
      {product.kategori ? (
        <Text style={styles.categoryBadge}>{product.kategori}</Text>
      ) : null}

      <View style={styles.customFieldsContainer}>
        {product.ekstraOzellikler && Object.entries(product.ekstraOzellikler).map(([key, val], idx) => (
          val ? (
            // YENİ EKLENEN KISIM: Her metni bir View içine alarak üst üste binmelerini (overlap) engelledik
            <View key={idx} style={styles.customFieldRow}>
              <Text style={styles.customFieldText} maxLines={2} textOverflow="ellipsis">
                <Text style={styles.customFieldLabel}>{key}: </Text>
                {val}
              </Text>
            </View>
          ) : null
        ))}
      </View>

      <View style={styles.priceContainer}>
        <Text style={styles.price}>{product.fiyat} TL</Text>
      </View>
    </View>
  </View>
);

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
          <View style={[styles.gridContainer, { marginTop: 5 }]}>
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