# Everlink Shopify Theme

A complete Shopify 2.0 theme for luxury jewelry with NFC technology integration. Built for the modern luxury jewelry brand that combines traditional craftsmanship with innovative technology.

![Everlink Theme](https://via.placeholder.com/1200x600/6BA4CE/FFFFFF?text=Everlink+Theme)

## Overview

**Everlink** is a premium Shopify 2.0 theme designed specifically for luxury jewelry brands that want to showcase their products with elegance while highlighting innovative features like NFC technology. The theme features a clean, minimalist design with a light blue color palette that conveys both luxury and modern technology.

### Key Features

- ✨ **Shopify 2.0 Compliant** - Full JSON template support with section and block architecture
- 🎨 **Luxury Design** - Clean, minimalist aesthetic with elegant typography
- 📱 **Mobile-First** - Fully responsive design optimized for all devices
- 🛍️ **Product Focused** - Beautiful product presentations with hover effects
- 🚀 **Performance Optimized** - Fast loading with lazy loading and optimized assets
- 🎯 **NFC Integration** - Dedicated sections for showcasing NFC technology
- 🔧 **Highly Customizable** - Easy to customize through Shopify theme editor
- 🛒 **Drawer Cart** - Smooth shopping experience with slide-out cart
- 💳 **Multiple Payment Icons** - Support for all major payment methods
- 🌐 **Multi-language Ready** - Internationalization support with locale files

## Color Palette

The theme uses a sophisticated color palette designed for luxury:

- **Primary (Light Blue)**: `#6BA4CE` - Main brand color
- **Primary Light**: `#B8D8E8` - Lighter shade for backgrounds
- **Primary Dark**: `#5A92B8` - Darker shade for accents
- **Secondary (Gold)**: `#D4AF37` - Luxury accent color
- **Text**: `#2C2C2C` - Main text color
- **Text Light**: `#666666` - Secondary text color
- **Background**: `#FFFFFF` - Main background
- **Background Alt**: `#F8FBFD` - Alternate background with blue tint

## Installation

### Method 1: Upload to Shopify

1. Download this theme as a ZIP file
2. Go to your Shopify admin panel
3. Navigate to **Online Store** > **Themes**
4. Click **Upload theme** and select the ZIP file
5. Once uploaded, click **Publish** to make it live

### Method 2: Shopify CLI (Development)

```bash
# Install Shopify CLI
npm install -g @shopify/cli @shopify/theme

# Navigate to the theme directory
cd everlink-shopify-theme

# Login to your store
shopify login

# Serve the theme for development
shopify theme serve

# Push to your store
shopify theme push
```

## Theme Structure

```
everlink-shopify-theme/
├── assets/              # CSS, JavaScript, images, fonts
│   ├── application.css  # Base styles and component library
│   ├── custom.css       # Theme-specific customizations
│   ├── global.js        # Core JavaScript functionality
│   ├── application.js   # Additional JavaScript features
│   └── custom.js        # Custom JavaScript enhancements
├── config/              # Theme settings
│   ├── settings_schema.json  # Theme customization options
│   └── settings_data.json    # Current theme settings
├── layout/              # Theme layouts
│   ├── theme.liquid     # Main theme layout
│   └── password.liquid  # Password page layout
├── locales/             # Translation files
│   └── en.default.json  # English translations
├── sections/            # Reusable sections
│   ├── header.liquid
│   ├── footer.liquid
│   ├── hero-banner.liquid
│   ├── featured-products.liquid
│   ├── product-categories.liquid
│   ├── about-us.liquid
│   ├── testimonials.liquid
│   ├── partner-logos.liquid
│   ├── newsletter.liquid
│   └── [more sections...]
├── snippets/            # Reusable code snippets
│   ├── product-card.liquid
│   ├── price.liquid
│   ├── cart-drawer.liquid
│   └── [more snippets...]
├── templates/           # Page templates (JSON)
│   ├── index.json       # Homepage
│   ├── product.json     # Product page
│   ├── collection.json  # Collection page
│   └── customers/       # Customer account pages
└── README.md
```

## Customization

### Theme Settings

Access the theme customization options through:
**Shopify Admin** > **Online Store** > **Themes** > **Customize**

Available customization options:

#### Colors
- Primary colors (light blue shades)
- Secondary color (gold accent)
- Text colors
- Background colors
- Status colors (error, success)

#### Typography
- Heading font
- Body font
- Font sizes and scales

#### Layout
- Page width
- Section spacing
- Products per row (desktop/mobile)

#### Product Settings
- Show vendor
- Show secondary image on hover
- Image size
- Enable zoom

#### Cart Settings
- Cart type (drawer or page)
- Enable cart notes

#### Social Media
- Facebook, Instagram, Twitter, Pinterest, TikTok, YouTube links

### Adding New Sections

The theme is fully compatible with Shopify 2.0 section architecture. To add a new section:

1. Create a new `.liquid` file in the `sections/` directory
2. Add the section schema at the bottom of the file
3. The section will automatically appear in the theme customizer

Example section structure:

```liquid
<section class="my-section" data-section-id="{{ section.id }}">
  <!-- Section content -->
</section>

{% schema %}
{
  "name": "My Section",
  "settings": [
    {
      "type": "text",
      "id": "heading",
      "label": "Heading",
      "default": "Section Heading"
    }
  ],
  "presets": [
    {
      "name": "My Section"
    }
  ]
}
{% endschema %}
```

### Customizing Colors

Colors can be customized in two ways:

1. **Theme Customizer**: Go to **Customize** > **Theme Settings** > **Colors**
2. **CSS Variables**: Edit `assets/application.css` and modify the CSS variables in the `:root` selector

### Adding Custom CSS

Add custom styles to `assets/custom.css`:

```css
/* Your custom styles */
.my-custom-class {
  color: #6BA4CE;
}
```

### Adding Custom JavaScript

Add custom JavaScript to `assets/custom.js`:

```javascript
// Your custom JavaScript
document.addEventListener('DOMContentLoaded', function() {
  // Your code here
});
```

## Homepage Sections

The default homepage includes these sections in order:

1. **Announcement Bar** - Important announcements and promotions
2. **Hero Banner** - Large banner with "everlink" branding and CTA buttons
3. **Product Categories** - Browse by category (Rings, Bracelets, Necklaces)
4. **Featured Products** - Showcase your best products
5. **About Us** - Brand story and mission
6. **Testimonials** - Customer reviews and feedback
7. **Partner Logos** - Featured in logos (e.g., "Psychology Today")
8. **Newsletter** - Email subscription form

All sections can be reordered, customized, or removed through the theme customizer.

## Product Features

### Product Card
- High-quality product images with hover effect (shows second image)
- Product title and price
- Sale badge for discounted items
- Sold out badge
- Quick add to cart button
- Smooth animations and transitions

### Product Page
- Large product images with zoom capability
- Product variants with elegant selection UI
- Add to cart functionality
- Social sharing buttons
- Product recommendations
- **NFC Technology Information** section (can be enabled/disabled)

## NFC Technology Integration

The theme includes dedicated support for showcasing NFC technology:

1. **Product Page NFC Info** - Toggle section showing NFC technology benefits
2. **Hero Banner** - Highlight "Luxury heirlooms driven by the latest in NFC technology"
3. **Product Descriptions** - Space for explaining NFC features
4. **About Section** - Emphasize the tech-meets-luxury positioning

### Customizing NFC Content

Edit the NFC information in:
- Product template section settings
- Product metafields (for product-specific NFC data)
- About Us section content

## Cart & Checkout

### Cart Drawer
The theme features a slide-out cart drawer for seamless shopping:

- Appears when items are added to cart
- Live quantity updates
- Remove items
- View subtotal
- Quick checkout or view full cart

### Cart Page
Full cart page with:
- Product list with images
- Quantity controls
- Order notes
- Subtotal calculation
- Checkout button

## Customer Accounts

Complete customer account functionality:

- Login/Register
- Account dashboard
- Order history
- Address management
- Password reset

All customer pages maintain the luxury theme aesthetic.

## Performance Optimization

The theme is optimized for performance:

- **Lazy Loading** - Images load only when needed
- **CSS Optimization** - Minimal, efficient stylesheets
- **JavaScript Efficiency** - Modern, vanilla JavaScript (no jQuery)
- **Asset Optimization** - Compressed and optimized assets
- **Mobile-First** - Optimized for mobile devices

## Browser Support

The theme supports all modern browsers:

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## SEO Features

Built-in SEO optimization:

- Semantic HTML structure
- Proper heading hierarchy
- Meta tags for social sharing (Open Graph, Twitter Cards)
- Structured data support
- Fast loading times
- Mobile-responsive design

## Accessibility

The theme follows accessibility best practices:

- Semantic HTML
- ARIA labels where appropriate
- Keyboard navigation support
- Skip to content links
- Proper color contrast ratios

## Support & Documentation

### Getting Help

- **Shopify Documentation**: [help.shopify.com](https://help.shopify.com)
- **Liquid Documentation**: [shopify.dev/docs/themes/liquid](https://shopify.dev/docs/themes/liquid)
- **Theme Issues**: Submit issues on GitHub

### Common Issues

**Q: How do I change the logo?**
A: Go to Customize > Header > Logo Image

**Q: How do I add products to the featured collection?**
A: Go to Customize > Featured Products > Select Collection

**Q: The cart drawer isn't working**
A: Make sure JavaScript is enabled and check the browser console for errors

**Q: How do I change the homepage sections?**
A: Go to Customize > Homepage and use the sidebar to add/remove/reorder sections

## Development

### Local Development

```bash
# Install dependencies (if any)
npm install

# Start Shopify theme development server
shopify theme serve

# Push changes to development theme
shopify theme push --development

# Pull changes from live theme
shopify theme pull
```

### Best Practices

1. **Always test changes** in a development theme before pushing to live
2. **Keep backups** of your theme before making major changes
3. **Use version control** (Git) to track changes
4. **Follow Shopify's** theme development best practices
5. **Optimize images** before uploading
6. **Test on multiple devices** and browsers

## Credits

- **Theme Name**: Everlink
- **Version**: 1.0.0
- **Shopify Version**: 2.0
- **Design**: Luxury jewelry with NFC technology focus
- **Colors**: Light blue palette (#6BA4CE) with gold accents

## License

This theme is provided as-is for use with Shopify stores. Please refer to Shopify's terms of service for usage guidelines.

## Changelog

### Version 1.0.0 (Initial Release)
- Complete Shopify 2.0 theme structure
- Homepage with 8 customizable sections
- Product and collection pages
- Customer account pages
- Cart drawer functionality
- Responsive design
- NFC technology integration sections
- Performance optimizations

---

**Built with ❤️ for luxury jewelry brands**

*For questions or support, please consult the Shopify theme documentation or contact your developer.*
