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

const THEME_PRESETS = {
  emeraldNavy: {
    name: 'Varsayılan (Zümrüt & Lacivert)',
    title: '#0f172a',
    code: '#334155',
    badgeBg: '#e0f2fe',
    badgeText: '#0284c7',
    priceBg: '#303b38',
    priceText: '#ffffff',
    cardBorder: '#e2e8f0'
  },
  industrialDark: {
    name: 'Endüstriyel Koyu',
    title: '#111827',
    code: '#4b5563',
    badgeBg: '#e5e7eb',
    badgeText: '#374151',
    priceBg: '#1f2937',
    priceText: '#f9fafb',
    cardBorder: '#d1d5db'
  },
  modernBlue: {
    name: 'Modern Mavi',
    title: '#1e3a8a',
    code: '#1d4ed8',
    badgeBg: '#dbeafe',
    badgeText: '#1d4ed8',
    priceBg: '#2563eb',
    priceText: '#ffffff',
    cardBorder: '#bfdbfe'
  },
  aggressiveRed: {
    name: 'Agresif Kırmızı',
    title: '#7f1d1d',
    code: '#991b1b',
    badgeBg: '#fee2e2',
    badgeText: '#b91c1c',
    priceBg: '#dc2626',
    priceText: '#ffffff',
    cardBorder: '#fecaca'
  }
};

const createStyles = (theme) => StyleSheet.create({
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
  coverPage: {
    padding: 0,
    position: 'relative',
    backgroundColor: '#0b1220',
    fontFamily: 'Roboto'
  },
  coverImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  coverOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 40,
    paddingVertical: 48,
    backgroundColor: 'rgba(0,0,0,0.45)'
  },
  coverTitle: {
    color: '#ffffff',
    fontSize: 30,
    fontWeight: 'bold',
    letterSpacing: 0.4
  },
  coverProject: {
    color: '#e2e8f0',
    fontSize: 14,
    marginTop: 8
  },

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
    borderColor: theme.cardBorder,
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
    color: '#94a3b8'
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
    color: theme.title,
    marginBottom: 3,
    height: 34,
    lineHeight: 1.2,
    overflow: 'hidden'
  },

  code: {
    fontSize: 8,
    color: theme.code,
    marginBottom: 5,
    fontWeight: 'bold'
  },

  categoryBadge: {
    backgroundColor: theme.badgeBg,
    color: theme.badgeText,
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
    color: '#334155',
    textAlign: 'center',
    lineHeight: 1.2
  },
  customFieldLabel: {
    fontWeight: 'bold',
    color: '#0f172a'
  },

  priceContainer: {
    backgroundColor: theme.priceBg,
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
    color: theme.priceText
  },

  pageNumber: {
    position: 'absolute',
    fontSize: 8,
    bottom: 8,
    left: 0,
    right: 0,
    textAlign: 'center',
    color: '#9ca3af'
  },
  backCoverContainer: {
    flex: 1,
    justifyContent: 'space-between',
    backgroundColor: '#0f172a',
    paddingHorizontal: 34,
    paddingVertical: 42,
    fontFamily: 'Roboto'
  },
  backCoverTitle: {
    color: '#f8fafc',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16
  },
  backCoverSubtitle: {
    color: '#cbd5e1',
    fontSize: 11
  },
  contactBox: {
    borderWidth: 1,
    borderColor: '#334155',
    borderStyle: 'solid',
    borderRadius: 10,
    padding: 16,
    backgroundColor: '#111c30'
  },
  contactLabel: {
    color: '#94a3b8',
    fontSize: 9,
    textTransform: 'uppercase',
    marginBottom: 2
  },
  contactValue: {
    color: '#f8fafc',
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 10
  }
});

const truncate = (value, maxLength = 140) => {
  if (value === null || value === undefined) return '';
  const text = String(value).replace(/\s+/g, ' ').trim();
  if (!text) return '';
  return text.length > maxLength ? `${text.slice(0, maxLength - 1)}…` : text;
};

const ProductCard = ({ product, styles }) => {
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

export const CatalogPDF = ({
  products,
  projectName,
  logoUrl,
  themeKey = 'emeraldNavy',
  coverImageUrl = '',
  coverTitle = '2026 Yedek Parça Kataloğu',
  includeCoverPage = false,
  includeBackCoverPage = false,
  backCoverContact = {}
}) => {
  const theme = THEME_PRESETS[themeKey] || THEME_PRESETS.emeraldNavy;
  const styles = createStyles(theme);

  // Tüm sayfalarda 6 ürün (2x3) kullanılır: sabit ritim, daha az alt boşluk.
  const pages = [];
  for (let i = 0; i < products.length; i += 6) {
    pages.push(products.slice(i, i + 6));
  }

  return (
    <Document>
      {includeCoverPage ? (
        <Page size="A4" style={styles.coverPage}>
          {coverImageUrl ? <Image src={coverImageUrl} style={styles.coverImage} /> : null}
          <View style={styles.coverOverlay}>
            <Text style={styles.coverTitle}>{coverTitle}</Text>
            <Text style={styles.coverProject}>{projectName}</Text>
          </View>
        </Page>
      ) : null}

      {pages.map((pageGroup, pageIndex) => (
        <Page key={pageIndex} size="A4" style={styles.page}>
          {pageIndex === 0 ? (
            <View style={styles.header}>
              {logoUrl ? <Image src={logoUrl} style={styles.logo} /> : <View style={styles.logoPlaceholder} />}
              <Text style={styles.catalogTitle}>{projectName}</Text>
            </View>
          ) : null}

          <View style={styles.gridContainer}>
            {pageGroup.map((product, index) => (
              <ProductCard key={product.id || `${pageIndex}-${index}`} product={product} styles={styles} />
            ))}
          </View>
          <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} fixed />
        </Page>
      ))}

      {includeBackCoverPage ? (
        <Page size="A4" style={styles.page}>
          <View style={styles.backCoverContainer}>
            <View>
              <Text style={styles.backCoverTitle}>İletişim</Text>
              <Text style={styles.backCoverSubtitle}>Sipariş, bayi ve teklif talepleri için bize ulaşın.</Text>
            </View>

            <View style={styles.contactBox}>
              <Text style={styles.contactLabel}>Adres</Text>
              <Text style={styles.contactValue}>{backCoverContact.address || '-'}</Text>

              <Text style={styles.contactLabel}>Telefon</Text>
              <Text style={styles.contactValue}>{backCoverContact.phone || '-'}</Text>

              <Text style={styles.contactLabel}>Web</Text>
              <Text style={styles.contactValue}>{backCoverContact.website || '-'}</Text>
            </View>
          </View>
        </Page>
      ) : null}
    </Document>
  );
};

export { THEME_PRESETS };
