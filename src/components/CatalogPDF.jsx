import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { padding: 40, backgroundColor: '#ffffff' },
  
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 30, 
    borderBottom: '2pt solid #f3f4f6', 
    paddingBottom: 10,
    height: 80 
  },
  logo: { width: 110, height: 60, objectFit: 'contain' },
  // Logo yoksa sağdaki başlığın düzenini korumak için görünmez kutu
  logoPlaceholder: { width: 110, height: 60 },
  catalogTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827', textTransform: 'uppercase' },
  
  gridContainer: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    justifyContent: 'space-between' 
  },
  
  productCard: {
    width: '48%', 
    height: 230, 
    marginBottom: 20,
    padding: 12,
    border: '1pt solid #f3f4f6',
    borderRadius: 8,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between' 
  },
  
  imageContainer: {
    height: 90, // Ekstra alanlara yer açmak için azıcık daha kıstık
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4
  },
  image: { width: 90, height: 90, objectFit: 'contain' },
  
  contentBox: { width: '100%', alignItems: 'center' },
  title: { 
    fontSize: 11, 
    fontWeight: 'bold', 
    textAlign: 'center', 
    color: '#1f2937', 
    marginBottom: 2,
    height: 26 
  },
  code: { fontSize: 8, color: '#6b7280', marginBottom: 4, fontStyle: 'italic' },
  
  categoryBadge: {
    backgroundColor: '#eff6ff',
    color: '#3b82f6',
    padding: '2 6',
    borderRadius: 4,
    fontSize: 7,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginBottom: 4
  },

  // YENİ: Ekstra Özel Alan Kutucukları
  customFieldsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 4,
    marginBottom: 6,
    height: 12 // Sabit yükseklik, taşmayı önler
  },
  customFieldBadge: {
    backgroundColor: '#f3f4f6',
    color: '#4b5563',
    padding: '2 4',
    borderRadius: 3,
    fontSize: 6,
    fontWeight: 'bold',
    textTransform: 'uppercase'
  },
  
  priceContainer: { 
    backgroundColor: '#f9fafb', 
    padding: '6 16', 
    borderRadius: 4, 
    width: '100%',
    alignItems: 'center'
  },
  price: { fontSize: 13, fontWeight: 'heavy', color: '#111827' },
  
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
      ) : (
        <View style={{ height: 12 }} /> 
      )}

      {/* YENİ: EKSTRA ALANLARIN BASILMASI */}
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