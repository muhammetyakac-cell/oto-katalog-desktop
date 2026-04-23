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
    paddingBottom: 10 
  },
  logo: { width: 100, height: 'auto', objectFit: 'contain' },
  catalogTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827' },
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  productCard: {
    width: '48%', 
    height: 260, // Boyutu görsele göre uzattık
    marginBottom: 20,
    padding: 10,
    border: '1pt solid #f3f4f6',
    borderRadius: 8,
    flexDirection: 'column',
    alignItems: 'center'
  },
  image: { 
    width: 125, // Yaklaşık %40 büyütüldü
    height: 125, 
    objectFit: 'contain', 
    marginBottom: 15 
  },
  contentBox: { width: '100%', alignItems: 'center' },
  title: { fontSize: 11, fontWeight: 'bold', textAlign: 'center', color: '#1f2937', marginBottom: 4 },
  code: { fontSize: 8, color: '#6b7280', marginBottom: 8, fontStyle: 'italic' },
  priceContainer: { 
    backgroundColor: '#f9fafb', 
    padding: '4 12', 
    borderRadius: 4, 
    marginTop: 'auto' 
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

export const CatalogPDF = ({ products, projectName, logoUrl }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Üst Bilgi / Logo Alanı */}
      <View style={styles.header}>
        {logoUrl ? (
          <Image src={logoUrl} style={styles.logo} />
        ) : (
          <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#3b82f6' }}>DZY Katalog</Text>
        )}
        <Text style={styles.catalogTitle}>{projectName}</Text>
      </View>

      {/* Ürün Gridi */}
      <View style={styles.gridContainer}>
        {products.map((product, index) => (
          <View key={index} style={styles.productCard}>
            {product.resimUrl && (
              <Image src={product.resimUrl} style={styles.image} />
            )}
            <View style={styles.contentBox}>
              <Text style={styles.title}>{product.urunAdi}</Text>
              <Text style={styles.code}>{product.stokKodu}</Text>
              <View style={styles.priceContainer}>
                <Text style={styles.price}>{product.fiyat} TL</Text>
              </View>
            </View>
          </View>
        ))}
      </View>
      <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} fixed />
    </Page>
  </Document>
);