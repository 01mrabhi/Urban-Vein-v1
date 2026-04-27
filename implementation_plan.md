# Update Products with Front & Back Images

We will update the product catalog to use your real front and back product images, replacing the dummy data. Since the current system only supports one image per product, we need to update both the database and the user interface.

> [!IMPORTANT]
> **User Review Required**
> Please review the titles, prices, and descriptions I've proposed for your images below. If you'd like to change any of them, please let me know. Otherwise, you can approve this plan and I'll start executing.

## Proposed Product Details

I found the images you uploaded. I will first rename them to standard formats without spaces (e.g., `batman_front.jpg`) to prevent issues, and then use the following details for them:

1. **Zoro Katana Tee**
   - **Category:** Graphic Series
   - **Price:** ₹1,499.00
   - **Description:** Heavyweight 300GSM premium cotton featuring the three-sword style architectural graphic.
   - **Images:** Zoro front, Zoro back

2. **Panther Strike Tee**
   - **Category:** Limited Drops
   - **Price:** ₹1,799.00
   - **Description:** Dark aesthetic with subtle panther motif. Pre-shrunk silicone wash for a structured fall.
   - **Images:** Panther front, Panther back

3. **Anime White Variant**
   - **Category:** Graphic Series
   - **Price:** ₹1,499.00
   - **Description:** Clean white variant featuring minimalist anime-inspired line art and drop shoulder fit.
   - **Images:** White anime front, White anime back

4. **Batman Series Tee**
   - **Category:** Oversized Collection
   - **Price:** ₹1,999.00
   - **Description:** The dark knight aesthetic. Architectural silhouettes in phantom black.
   - **Images:** Batman front, Batman back

5. **CSK Edition Tee**
   - **Category:** Essential Solids
   - **Price:** ₹1,299.00
   - **Description:** Classic edition heavyweight tee for everyday urban environments.
   - **Images:** Csk front, Csk back

*(Note: We will clear the existing 8 dummy products in Supabase and replace them with these 5 real ones)*

## Proposed Technical Changes

### Database (Supabase)
We will update the `products` table in Supabase.
- Add a new column `image_back` (TEXT) to store the URL/path of the back image.
- Execute an SQL script to insert the products with the details above.

### Image Files
- Rename the `.jpeg` files in `public/products/` to lowercase with underscores to ensure clean URLs.

### UI Components

#### [MODIFY] `lib/data.ts`
- Update the `Product` type definition to include `image_back?: string`.
- Update the static `PRODUCTS` array and `CATEGORIES` to match the new inventory.

#### [MODIFY] `components/ProductCard.tsx`
- Implement a hover effect so that when a user hovers over the product card on the homepage, it smoothly transitions from the front image to the back image.

#### [MODIFY] `app/products/[id]/page.tsx`
- Update the product details page to support an image gallery.
- We will add thumbnails so the user can click to view both the front and back images.

## Verification Plan
1.  **Data Verification:** Verify the new products load correctly from Supabase.
2.  **UI Testing:** Check the hover effects on the homepage and the image gallery on the product detail page.
