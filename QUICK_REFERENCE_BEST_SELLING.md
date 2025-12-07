# 🔥 Quick Reference - API Sản phẩm Bán chạy

## Endpoint

```
GET /api/products/best-selling
```

### URL đầy đủ
```
http://localhost:8080/api/products/best-selling
```

---

## 📋 Response

```json
[
  {
    "id": "uuid",
    "name": "Áo thun nam hot",
    "price": 299000.00,
    "imageUrl": "https://example.com/ao-thun.jpg"
  },
  {
    "id": "uuid",
    "name": "Quần jean nữ",
    "price": 599000.00,
    "imageUrl": "https://example.com/quan-jean.jpg"
  }
]
```

**⭐ Đặc điểm:** Sắp xếp từ bán nhiều nhất → ít nhất

---

## 🎯 Use Cases

### 1. Homepage "Bán chạy nhất"
```javascript
fetch('/api/products/best-selling')
  .then(res => res.json())
  .then(products => {
    displayBestSellers(products.slice(0, 8)); // Top 8
  });
```

### 2. Sidebar Widget
```javascript
// Top 5 trending
const top5 = products.slice(0, 5);
```

### 3. Full Page
```javascript
// All best-sellers
displayAllBestSellers(products);
```

---

## 💻 Code Examples

### JavaScript/Fetch
```javascript
fetch('http://localhost:8080/api/products/best-selling')
  .then(res => res.json())
  .then(products => {
    console.log('Best sellers:', products);
    products.forEach((p, i) => {
      console.log(`#${i+1}: ${p.name} - ${p.price}đ`);
    });
  });
```

### React
```jsx
function BestSellers() {
  const [products, setProducts] = useState([]);
  
  useEffect(() => {
    fetch('/api/products/best-selling')
      .then(res => res.json())
      .then(data => setProducts(data.slice(0, 10)));
  }, []);
  
  return (
    <div className="best-sellers">
      <h2>🔥 Bán chạy nhất</h2>
      {products.map((p, i) => (
        <div key={p.id} className="product">
          <span className="rank">#{i+1}</span>
          <img src={p.imageUrl} alt={p.name} />
          <h3>{p.name}</h3>
          <p>{p.price.toLocaleString()} ₫</p>
        </div>
      ))}
    </div>
  );
}
```

### Vue
```vue
<template>
  <div class="best-sellers">
    <h2>🔥 Best Sellers</h2>
    <div v-for="(p, i) in products" :key="p.id">
      <span>#{{ i+1 }}</span>
      <img :src="p.imageUrl" />
      <h3>{{ p.name }}</h3>
      <p>{{ p.price.toLocaleString() }} ₫</p>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return { products: [] }
  },
  mounted() {
    fetch('/api/products/best-selling')
      .then(res => res.json())
      .then(data => this.products = data.slice(0, 10));
  }
}
</script>
```

---

## 🧪 Testing

### cURL
```bash
curl http://localhost:8080/api/products/best-selling
```

### Postman
```
Method: GET
URL: http://localhost:8080/api/products/best-selling
```

### Browser
```
http://localhost:8080/api/products/best-selling
```

---

## 📊 Logic

### Tính "bán chạy":
1. Chỉ tính đơn hàng **Completed**
2. SUM(quantity) từ OrderDetails
3. GROUP BY Product
4. ORDER BY SUM DESC

### SQL tương đương:
```sql
SELECT p.*, SUM(od.quantity) as total_sold
FROM Product p
JOIN ProductDetails pd ON p.p_id = pd.p_id
JOIN OrderDetails od ON pd.pd_id = od.pd_id
JOIN Orders o ON od.o_id = o.o_id
WHERE o.status = 'Completed'
GROUP BY p.p_id
ORDER BY total_sold DESC
```

---

## 🔒 Permissions

| User | Xem được |
|------|----------|
| Guest | Active products only |
| User | Active products only |
| Admin | All products |

---

## 📐 Comparison

| API | Sort | Use Case |
|-----|------|----------|
| `/list` | None | General listing |
| `/list?search=...` | None | Search results |
| **`/best-selling`** | **By sales ↓** | **Trending/Popular** |
| `/detail/{id}` | N/A | Single product |

---

## 💡 Frontend Tips

### 1. Display Top N
```javascript
const top10 = products.slice(0, 10);
```

### 2. Add Ranking Badge
```jsx
<span className="rank">#{index + 1}</span>
```

### 3. Add "Hot" Badge
```jsx
{index < 3 && <span className="hot-badge">🔥 HOT</span>}
```

### 4. Carousel
```javascript
// Auto-scroll through best sellers
const carousel = new Swiper('.best-sellers-carousel', {
  slidesPerView: 4,
  autoplay: true
});
```

---

## ⚡ Performance

### Frontend Caching
```javascript
// Cache for 5 minutes
const CACHE_TIME = 5 * 60 * 1000;
let cachedData = null;
let cacheTime = 0;

async function getBestSellers() {
  const now = Date.now();
  if (cachedData && (now - cacheTime) < CACHE_TIME) {
    return cachedData;
  }
  
  const res = await fetch('/api/products/best-selling');
  cachedData = await res.json();
  cacheTime = now;
  return cachedData;
}
```

### Lazy Loading
```jsx
<img 
  src={product.imageUrl} 
  loading="lazy" 
  alt={product.name}
/>
```

---

## 🎨 UI Suggestions

### Design 1: Grid with Ranking
```
┌─────────────────────────────────────┐
│  🔥 Sản phẩm bán chạy nhất          │
├─────┬─────┬─────┬─────┬─────┬─────┤
│ #1  │ #2  │ #3  │ #4  │ #5  │ #6  │
│[img]│[img]│[img]│[img]│[img]│[img]│
│ Tên │ Tên │ Tên │ Tên │ Tên │ Tên │
│ Giá │ Giá │ Giá │ Giá │ Giá │ Giá │
└─────┴─────┴─────┴─────┴─────┴─────┘
```

### Design 2: List with Stats
```
┌────────────────────────────────────┐
│ 🔥 Top Sellers                     │
├────────────────────────────────────┤
│ #1 [img] Áo thun...    299,000₫   │
│ #2 [img] Quần jean...  599,000₫   │
│ #3 [img] Áo khoác...   899,000₫   │
└────────────────────────────────────┘
```

### Design 3: Carousel
```
┌────────────────────────────────────┐
│  ← [Product 1] [Product 2] ... →   │
│     ⚫ ⚫ ⚫ ⚪ ⚪                    │
└────────────────────────────────────┘
```

---

## ✅ Checklist

Frontend integration:
- [ ] Fetch best-selling products
- [ ] Display top N products
- [ ] Add ranking numbers (#1, #2, ...)
- [ ] Add "Hot" or "Trending" badges
- [ ] Handle loading state
- [ ] Handle empty state
- [ ] Make responsive
- [ ] Add click to detail

---

## 🔗 Related APIs

- `/api/products/list` - All products
- `/api/products/detail/{id}` - Product detail
- `/api/products/list?search=...` - Search

---

## 📖 Full Documentation

See: `BEST_SELLING_API_DOCUMENTATION.md`

---

**Ready to use! 🚀**

