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

    paddingTop: 18,

    paddingBottom: 18,

    paddingHorizontal: 30,

    backgroundColor: '#ffffff',

    fontFamily: 'Roboto'

  },



  header: {

    flexDirection: 'row',

    justifyContent: 'space-between',

    alignItems: 'center',

    marginBottom: 10,

    borderBottomWidth: 2,

    borderBottomColor: '#f3f4f6',

    borderBottomStyle: 'solid',

    paddingBottom: 8,

    height: 54

  },

  logo: { width: 96, height: 44, objectFit: 'contain' },

  logoPlaceholder: { width: 96, height: 44 },

  catalogTitle: { fontSize: 16, fontWeight: 'bold', color: '#111827', textTransform: 'uppercase' },



  gridContainer: {

    flexDirection: 'row',

    flexWrap: 'wrap',

    justifyContent: 'space-between'

  },



  // Kartlar özellikle dikey olarak genişletildi ve sabit alanlara bölündü.

  productCard: {

    width: '49%',

    height: 236,

    marginBottom: 6,

    paddingVertical: 9,

    paddingHorizontal: 11,

    borderWidth: 1,

    borderColor: '#e2e8f0',

    borderStyle: 'solid',

    borderRadius: 10,

    flexDirection: 'column',

    alignItems: 'center',

    backgroundColor: '#ffffff'

  },



  imageContainer: {

    height: 84,

    width: '100%',

    backgroundColor: '#f8fafc',

    borderRadius: 8,

    borderWidth: 1,

    borderColor: '#e2e8f0',

    borderStyle: 'solid',

    display: 'flex',

    justifyContent: 'center',

    alignItems: 'center',

    marginBottom: 6

  },

  image: { width: 78, height: 78, objectFit: 'contain' },

  imagePlaceholderText: {

    fontSize: 8,

    color: '#34465f'

  },



  contentBox: {

    width: '100%',

    alignItems: 'center',

    flex: 1

  },



  title: {

    fontSize: 11,

    fontWeight: 'bold',

    textAlign: 'center',

    color: '#0f172a',

    marginBottom: 3,

    height: 34,

    lineHeight: 1.2,

    overflow: 'hidden'

  },



  code: {

    fontSize: 8,

    color: '#0144a1',

    marginBottom: 5,

    fontWeight: 'bold'

  },



  categoryBadge: {

    backgroundColor: '#90afc5',

    color: '#0284c7',

    paddingVertical: 2,

    paddingHorizontal: 6,

    borderRadius: 8,

    fontSize: 7,

    fontWeight: 'bold',

    textTransform: 'uppercase',

    marginBottom: 5

  },



  customFieldsContainer: {

    width: '100%',

    alignItems: 'center',

    minHeight: 60,

    justifyContent: 'flex-start',

    overflow: 'hidden'

  },

  customFieldRow: {

    width: '100%',

    height: 19,

    justifyContent: 'center',

    overflow: 'hidden'

  },

  customFieldText: {

    fontSize: 7.2,

    color: '#003072',

    textAlign: 'center',

    lineHeight: 1.2

  },

  customFieldLabel: {

    fontWeight: 'bold',

    color: '#0c121b'

  },



  priceContainer: {

    backgroundColor: '#454759',

    paddingVertical: 5,

    paddingHorizontal: 15,

    borderRadius: 7,

    alignItems: 'center',

    marginTop: 'auto',

    width: '82%'

  },

  price: {

    fontSize: 12,

    fontWeight: 'bold',

    color: '#ffffff'

  },



  pageNumber: {

    position: 'absolute',

    fontSize: 8,

    bottom: 8,

    left: 0,

    right: 0,

    textAlign: 'center',

    color: '#9ca3af'

  }

});



const truncate = (value, maxLength = 140) => {

  if (value === null || value === undefined) return '';

  const text = String(value).replace(/\s+/g, ' ').trim();

  if (!text) return '';

  return text.length > maxLength ? `${text.slice(0, maxLength - 1)}…` : text;

};



const ProductCard = ({ product }) => {

  const visibleFields = Object.entries(product.ekstraOzellikler || {})

    .filter(([, val]) => String(val || '').trim())

    .slice(0, 3);



  return (

    <View style={styles.productCard} wrap={false}>

      <View style={styles.imageContainer}>

        {product.resimUrl ? (

          <Image src={product.resimUrl} style={styles.image} />

        ) : (

          <Text style={styles.imagePlaceholderText}>Görsel Yok</Text>

        )}

      </View>



      <View style={styles.contentBox}>

        <Text style={styles.title}>{truncate(product.urunAdi, 140)}</Text>

        <Text style={styles.code}>{truncate(product.stokKodu, 60)}</Text>



        {product.kategori ? (

          <Text style={styles.categoryBadge}>{truncate(product.kategori, 52)}</Text>

        ) : null}



        <View style={styles.customFieldsContainer}>

          {visibleFields.map(([key, val], idx) => (

            <View key={`${key}-${idx}`} style={styles.customFieldRow}>

              <Text style={styles.customFieldText}>

                <Text style={styles.customFieldLabel}>{truncate(key, 28)}: </Text>

                {truncate(val, 260)}

              </Text>

            </View>

          ))}

        </View>



        <View style={styles.priceContainer}>

          <Text style={styles.price}>{product.fiyat} TL</Text>

        </View>

      </View>

    </View>

  );

};



export const CatalogPDF = ({ products, projectName, logoUrl }) => {

  // Tüm sayfalarda 6 ürün (2x3) kullanılır: sabit ritim, daha az alt boşluk.

  const pages = [];

  for (let i = 0; i < products.length; i += 6) {

    pages.push(products.slice(i, i + 6));

  }



  return (

    <Document>

      {pages.map((pageGroup, pageIndex) => (

        <Page key={pageIndex} size="A4" style={styles.page}>

          <View style={styles.header}>

            {logoUrl ? <Image src={logoUrl} style={styles.logo} /> : <View style={styles.logoPlaceholder} />}

            <Text style={styles.catalogTitle}>{projectName}</Text>

          </View>



          <View style={styles.gridContainer}>

            {pageGroup.map((product, index) => (

              <ProductCard key={product.id || `${pageIndex}-${index}`} product={product} />

            ))}

          </View>

          <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} fixed />

        </Page>

      ))}

    </Document>

  );

};