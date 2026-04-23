import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image, Font } from '@react-pdf/renderer';

// Türkçe karakter desteği için Roboto
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
    paddingBottom: 30, // Alt boşluğu yaklaşık 1 cm'ye sabitlemek için daralttık
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
    height: 240, // Dikey olarak genişletildi (195'ten 240'a)
    marginBottom: 15, // Satırlar arası boşluk optimize edildi
    padding: 12,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    borderStyle: 'solid',
    borderRadius: 10,
    flexDirection: 'column',
    alignItems: 'center'
  },
  
  imageContainer: {
    height: 125, // Kutu genişlediği için görsel alanını da büyüttük
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6 
  },
  image: { width: 125, height: 125, objectFit: 'contain' },
  
  contentBox: { 
    width: '100%', 
    alignItems: 'center',
    flex: 1 
  },
  
  title: { 
    fontSize: 10, 
    fontWeight: 'bold', 
    textAlign: 'center', 
    color: '#1f2937', 
    marginBottom: 3,
    height: 24, 
    lineHeight: 1.2
  },
  code: { fontSize: 8, color: '#6b7280', marginBottom: 5, fontStyle: 'italic' },
  
  categoryBadge: {
    backgroundColor: '#eff6ff',
    color: '#3b82f6',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 4,
    fontSize: 7,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginBottom: 5
  },

  customFieldsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 4,
    marginBottom: 5
  },
  customFieldBadge: {
    backgroundColor: '#f3f4f6',
    color: '#4b5563',
    paddingVertical: 2,
    paddingHorizontal: 5,
    borderRadius: 3,
    fontSize: 6,
    fontWeight: 'bold',
    textTransform: 'uppercase'
  },
  
  priceContainer: { 
    backgroundColor: '#f9fafb', 
    paddingVertical: 6,
    paddingHorizontal: 15,
    borderRadius: 6, 
    width: '100%',
    alignItems: 'center',
    marginTop: 'auto' // Fiyat her zaman kutunun en dibinde kalır
  },
  price: { fontSize: 13, fontWeight: 'bold', color: '#111827' },
  
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
      <Text style={styles.title}>{product.urunAdi}</Text>
      <Text style={styles.code}>{product.stokKodu}</Text>
      
      {product.kategori ? (
        <Text style={styles.categoryBadge}>{product.kategori}</Text>
      ) : null}

      <View style={styles.customFieldsContainer}>
        {product.ekstraOzellikler && Object.entries(product.ekstraOzellikler).map(([key, val], idx) => (
          val ? <Text key={idx} style={styles.customFieldBadge}>{key}: {val}</Text> : null
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
      {/* İlk Sayfa */}
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

      {/* Diğer Sayfalar */}
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