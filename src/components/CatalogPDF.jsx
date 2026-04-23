import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image, Font } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { padding: 30, backgroundColor: '#ffffff' },
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  productCard: {
    width: '48%', // 2 Sütun yapısı
    height: 180,
    marginBottom: 15,
    padding: 10,
    border: '1pt solid #eeeeee',
    borderRadius: 5,
    flexDirection: 'column',
    alignItems: 'center'
  },
  image: { width: 80, height: 80, objectFit: 'contain', marginBottom: 5 },
  title: { fontSize: 10, fontWeight: 'bold', textAlign: 'center', marginBottom: 3 },
  code: { fontSize: 8, color: '#666666', marginBottom: 5 },
  price: { fontSize: 12, fontWeight: 'heavy', color: '#1a1a1a' }
});

export const CatalogPDF = ({ products }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.gridContainer}>
        {products.map((product, index) => (
          <View key={index} style={styles.productCard}>
            {product.resimUrl && (
              <Image src={product.resimUrl} style={styles.image} />
            )}
            <Text style={styles.title}>{product.urunAdi}</Text>
            <Text style={styles.code}>{product.stokKodu}</Text>
            <Text style={styles.price}>{product.fiyat} TL</Text>
          </View>
        ))}
      </View>
    </Page>
  </Document>
);