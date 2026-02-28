const quickMenu = [
  "Laptop",
  "PC GVN",
  "Màn hình",
  "Bàn phím",
  "Chuột",
  "Tai nghe",
  "Ghế gaming",
  "Phụ kiện",
];

const products = [
  {
    name: "Laptop Gaming MSI Katana 15 B13VFK",
    price: "24.990.000₫",
    oldPrice: "29.990.000₫",
    tag: "Giảm 17%",
  },
  {
    name: "PC GVN i5 RTX 4060 - Ready To Play",
    price: "21.490.000₫",
    oldPrice: "23.990.000₫",
    tag: "Bán chạy",
  },
  {
    name: "Màn hình LG UltraGear 27GS75Q-B 180Hz",
    price: "6.490.000₫",
    oldPrice: "7.390.000₫",
    tag: "Hot",
  },
  {
    name: "Chuột Logitech G Pro X Superlight 2",
    price: "2.790.000₫",
    oldPrice: "3.290.000₫",
    tag: "Mới",
  },
  {
    name: "Bàn phím cơ AKKO 5075B Plus",
    price: "1.990.000₫",
    oldPrice: "2.290.000₫",
    tag: "Deal sốc",
  },
  {
    name: "Tai nghe HyperX Cloud III Wireless",
    price: "2.490.000₫",
    oldPrice: "2.990.000₫",
    tag: "Quà tặng",
  },
];

export default function Home() {
  return (
    <main className="gearPage">
      <div className="topSale">FREESHIP đơn từ 500K • Trả góp 0% • Bảo hành chính hãng</div>

      <header className="header">
        <div className="container headMain">
          <a href="#" className="logo">GEARVN</a>
          <div className="searchWrap">
            <input placeholder="Bạn cần tìm gì hôm nay..." />
            <button>Tìm kiếm</button>
          </div>
          <div className="headActions">
            <a href="#">Hotline 1900.5301</a>
            <a href="#">Giỏ hàng</a>
          </div>
        </div>
      </header>

      <nav className="quickNav">
        <div className="container quickWrap">
          {quickMenu.map((item) => (
            <a href="#" key={item}>{item}</a>
          ))}
        </div>
      </nav>

      <section className="container heroGrid">
        <aside className="categoryCol">
          <h3>Danh mục sản phẩm</h3>
          <ul>
            <li>Laptop Gaming</li>
            <li>PC GVN</li>
            <li>Main, CPU, VGA</li>
            <li>Màn hình</li>
            <li>Bàn phím, Chuột</li>
            <li>Tai nghe, Loa</li>
            <li>Ghế - Bàn Gaming</li>
            <li>Phụ kiện công nghệ</li>
          </ul>
        </aside>

        <div className="heroBanner">
          <p className="badge">SIÊU SALE THÁNG 2</p>
          <h1>Build PC - Săn Gear xịn Giá tốt mỗi ngày</h1>
          <p>Ưu đãi lên đến 40% cho hàng loạt sản phẩm gaming gear và linh kiện.</p>
          <a href="#">Mua ngay</a>
        </div>

        <div className="sideBanners">
          <article>
            <h4>Laptop RTX 50 Series</h4>
            <p>Trả góp 0% • Quà tặng độc quyền</p>
          </article>
          <article>
            <h4>Màn hình 180Hz</h4>
            <p>Giảm thêm đến 1.000.000₫</p>
          </article>
        </div>
      </section>

      <section className="container productSection">
        <div className="sectionTitle">
          <h2>Sản phẩm nổi bật</h2>
          <a href="#">Xem tất cả</a>
        </div>

        <div className="productGrid">
          {products.map((p) => (
            <article key={p.name} className="productCard">
              <span className="tag">{p.tag}</span>
              <div className="thumb">IMAGE</div>
              <h3>{p.name}</h3>
              <div className="priceRow">
                <strong>{p.price}</strong>
                <del>{p.oldPrice}</del>
              </div>
              <button>Thêm vào giỏ</button>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
