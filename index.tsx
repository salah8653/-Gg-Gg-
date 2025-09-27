import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  onAuthStateChanged, 
  signOut,
  type User
} from 'firebase/auth';

// --- FIREBASE CONFIG ---
// هام: استبدل هذه القيم بالمعلومات الخاصة بمشروعك على Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBk9sPNpV_RNMGv6ZHwrof2y8GOItwr7Lc",
  authDomain: "sportec-iraq.firebaseapp.com",
  projectId: "sportec-iraq",
  storageBucket: "sportec-iraq.appspot.com",
  messagingSenderId: "1027930735865",
  appId: "1:1027930735865:web:b5e1b3e98d87f4452b0e28"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);


// --- TYPE DEFINITIONS ---
interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
}

interface Partner {
  id: number;
  name: string;
  logo: string;
}

interface CartItem extends Product {
  quantity: number;
}

// --- MOCK DATA ---
const initialProducts: Product[] = [
  { id: 1, name: 'ساعة ذكية حديثة', price: 750, image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wzOT二次xyMi0zNHwyfHwyfHwyfHx8&ixlib=rb-4.0.3&q=80&w=400' },
  { id: 2, name: 'سماعات رأس لاسلكية', price: 500, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wzOT二次xyMi0zNHwyfHwyfHwyfHx8&ixlib=rb-4.0.3&q=80&w=400' },
  { id: 3, name: 'حذاء رياضي أنيق', price: 450, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wzOT二次xyMi0zNHwyfHwyfHwyfHx8&ixlib=rb-4.0.3&q=80&w=400' },
  { id: 4, name: 'كاميرا احترافية', price: 2500, image: 'https://images.unsplash.com/photo-1512790182412-b19e6d62bc39?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wzOT二次xyMi0zNHwyfHwyfHwyfHx8&ixlib=rb-4.0.3&q=80&w=400' },
];

const initialOrders = [
    {id: 101, customer: 'علي حسن', total: 1250, status: 'قيد التجهيز'},
    {id: 102, customer: 'فاطمة محمد', total: 450, status: 'تم الشحن'},
    {id: 103, customer: 'أحمد خالد', total: 3000, status: 'تم التوصيل'},
];

const initialPartners: Partner[] = [
    { id: 1, name: 'Partner A', logo: 'https://via.placeholder.com/150/4a90e2/FFFFFF?text=Partner+A' },
    { id: 2, name: 'Partner B', logo: 'https://via.placeholder.com/150/9013fe/FFFFFF?text=Partner+B' },
    { id: 3, name: 'Partner C', logo: 'https://via.placeholder.com/150/CCCCCC/FFFFFF?text=Partner+C' },
];


// --- COMPONENTS ---

const LoginPage: React.FC<{
    onLogin: (email: string, pass: string) => Promise<void>;
    onSignUp: (email: string, pass: string) => Promise<void>;
    error: string | null;
    loading: boolean;
}> = ({ onLogin, onSignUp, error, loading }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        onLogin(email, password);
    };

    const handleSignUp = (e: React.FormEvent) => {
        e.preventDefault();
        onSignUp(email, password);
    }

    return (
        <div className="login-container">
            <div className="login-form-container">
                <h2>أهلاً بك في<br/>انت فد شي</h2>
                <form className="login-form">
                    <div className="form-group">
                        <label>البريد الإلكتروني</label>
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label>كلمة المرور</label>
                        <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
                    </div>
                    {error && <p className="auth-error">{error}</p>}
                    <div className="auth-buttons">
                        <button onClick={handleLogin} className="btn btn-primary" disabled={loading}>
                            {loading ? '...جاري الدخول' : 'تسجيل الدخول'}
                        </button>
                        <button onClick={handleSignUp} className="btn btn-secondary" disabled={loading}>
                            {loading ? '...' : 'إنشاء حساب جديد'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const Header: React.FC<{
  isAdmin: boolean;
  onToggleAdmin: () => void;
  cartCount: number;
  savedCount: number;
  activeView: string;
  setActiveView: (view: string) => void;
  user: User | null;
  onLogout: () => void;
}> = ({ isAdmin, onToggleAdmin, cartCount, savedCount, activeView, setActiveView, user, onLogout }) => {
  
  const isAdminUser = user?.email === 'admin@example.com'; // Change this to your admin email

  return (
    <header>
      <div className="app-container header-content">
        <h1 className="logo">انت فد شي</h1>
        <nav>
          <a href="#" onClick={() => setActiveView('home')} className={activeView === 'home' ? 'active' : ''}>
             <span className="material-icons">home</span> الرئيسية
          </a>
          <a href="#" onClick={() => setActiveView('cart')} className={activeView === 'cart' ? 'active' : ''}>
             <span className="material-icons">shopping_cart</span> السلة ({cartCount})
          </a>
          <a href="#" onClick={() => setActiveView('saved')} className={activeView === 'saved' ? 'active' : ''}>
            <span className="material-icons">favorite</span> المحفوظات ({savedCount})
          </a>
        </nav>
        <div className="header-actions">
            {isAdminUser && (
                <div className="admin-toggle">
                    <span>وضع الأدمن</span>
                    <label className="switch">
                        <input type="checkbox" checked={isAdmin} onChange={onToggleAdmin} />
                        <span className="slider"></span>
                    </label>
                </div>
            )}
            <button onClick={onLogout} className="btn btn-logout">تسجيل الخروج</button>
        </div>
      </div>
    </header>
  );
};

const ProductCard: React.FC<{ 
    product: Product; 
    onAddToCart: (product: Product) => void;
    onToggleSaved: (product: Product) => void;
    isSaved: boolean;
}> = ({ product, onAddToCart, onToggleSaved, isSaved }) => {
  return (
    <div className="product-card">
      <img src={product.image} alt={product.name} />
      <div className="product-card-content">
        <h3>{product.name}</h3>
        <p className="price">{product.price.toLocaleString()} د.ع</p>
        <div className="product-card-actions">
          <button className="btn btn-primary" onClick={() => onAddToCart(product)}>
            <span className="material-icons">add_shopping_cart</span>
            أضف للسلة
          </button>
           <button className={`btn-icon ${isSaved ? 'saved' : ''}`} onClick={() => onToggleSaved(product)}>
            <span className="material-icons">{isSaved ? 'favorite' : 'favorite_border'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

const ProductList: React.FC<{ 
    products: Product[]; 
    onAddToCart: (product: Product) => void;
    onToggleSaved: (product: Product) => void;
    savedItems: Product[];
}> = ({ products, onAddToCart, onToggleSaved, savedItems }) => {
  return (
    <div>
      <h2>أحدث المنتجات</h2>
      <div className="product-grid">
        {products.map(product => (
          <ProductCard 
            key={product.id} 
            product={product} 
            onAddToCart={onAddToCart}
            onToggleSaved={onToggleSaved}
            isSaved={savedItems.some(item => item.id === product.id)}
          />
        ))}
      </div>
    </div>
  );
};

const PartnersSection: React.FC<{ partners: Partner[] }> = ({ partners }) => {
    if (partners.length === 0) return null;

    return (
        <div className="partners-section">
            <h2>شركاؤنا</h2>
            <div className="partners-grid">
                {partners.map(partner => (
                    <div key={partner.id} className="partner-logo">
                        <img src={partner.logo} alt={partner.name} title={partner.name} />
                    </div>
                ))}
            </div>
        </div>
    );
};


const CartPage: React.FC<{ cartItems: CartItem[]; onRemoveFromCart: (id: number) => void }> = ({ cartItems, onRemoveFromCart }) => {
  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="cart-page">
      <h2>سلة التسوق</h2>
      {cartItems.length === 0 ? (
        <p className="empty-message">سلتك فارغة حالياً.</p>
      ) : (
        <div>
          {cartItems.map(item => (
            <div key={item.id} className="cart-item">
              <img src={item.image} alt={item.name} />
              <div className="item-details">
                <h4>{item.name}</h4>
                <p>{item.price.toLocaleString()} د.ع x {item.quantity}</p>
              </div>
              <button className="btn btn-danger" onClick={() => onRemoveFromCart(item.id)}>
                <span className="material-icons">delete</span>
              </button>
            </div>
          ))}
          <div className="cart-total">
            <h3>الإجمالي: {total.toLocaleString()} د.ع</h3>
          </div>
        </div>
      )}
    </div>
  );
};

const SavedPage: React.FC<{ savedItems: Product[]; onToggleSaved: (product: Product) => void, onAddToCart: (product: Product) => void }> = ({ savedItems, onToggleSaved, onAddToCart }) => {
    return (
        <div className="saved-page">
            <h2>المنتجات المحفوظة</h2>
            {savedItems.length === 0 ? (
                <p className="empty-message">لا يوجد لديك منتجات محفوظة.</p>
            ) : (
                <div>
                    {savedItems.map(item => (
                        <div key={item.id} className="saved-item">
                            <img src={item.image} alt={item.name} />
                            <div className="item-details">
                                <h4>{item.name}</h4>
                                <p>{item.price.toLocaleString()} د.ع</p>
                            </div>
                            <button className="btn btn-primary" onClick={() => onAddToCart(item)}>
                                <span className="material-icons">add_shopping_cart</span>
                            </button>
                             <button className="btn btn-danger" onClick={() => onToggleSaved(item)}>
                                <span className="material-icons">delete</span>
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const AdminDashboard: React.FC<{ 
    products: Product[]; 
    onAddProduct: (product: Omit<Product, 'id'>) => void;
    onDeleteProduct: (id: number) => void;
    partners: Partner[];
    onAddPartner: (partner: Omit<Partner, 'id'>) => void;
    onDeletePartner: (id: number) => void;
}> = ({ products, onAddProduct, onDeleteProduct, partners, onAddPartner, onDeletePartner }) => {
  const [newProductName, setNewProductName] = useState('');
  const [newProductPrice, setNewProductPrice] = useState('');
  const [newProductImage, setNewProductImage] = useState<string | null>(null);
  const [newPartnerName, setNewPartnerName] = useState('');
  const [newPartnerLogo, setNewPartnerLogo] = useState<string | null>(null);


  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewProductImage(reader.result as string);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };
  
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewPartnerLogo(reader.result as string);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newProductName && newProductPrice && newProductImage) {
      onAddProduct({
        name: newProductName,
        price: parseFloat(newProductPrice),
        image: newProductImage,
      });
      setNewProductName('');
      setNewProductPrice('');
      setNewProductImage(null);
      (e.target as HTMLFormElement).reset();
    }
  };
  
  const handlePartnerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPartnerName && newPartnerLogo) {
      onAddPartner({
        name: newPartnerName,
        logo: newPartnerLogo,
      });
      setNewPartnerName('');
      setNewPartnerLogo(null);
      (e.target as HTMLFormElement).reset();
    }
  };

  return (
    <div>
      <h2>لوحة تحكم الأدمن</h2>
      <div className="admin-dashboard">
        <div className="admin-panel">
          <h3>إدارة المنتجات</h3>
          <form onSubmit={handleProductSubmit}>
            <div className="form-group">
              <label>اسم المنتج</label>
              <input type="text" value={newProductName} onChange={e => setNewProductName(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>السعر</label>
              <input type="number" value={newProductPrice} onChange={e => setNewProductPrice(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>صورة المنتج</label>
              <input type="file" accept="image/*" onChange={handleImageUpload} required />
              {newProductImage && <img src={newProductImage} alt="Preview" className="image-preview" />}
            </div>
            <button type="submit" className="btn btn-primary">إضافة منتج</button>
          </form>
          <hr style={{margin: '30px 0'}}/>
          <h4>المنتجات الحالية</h4>
          <ul className="admin-list">
            {products.map(p => (
              <li key={p.id} className="admin-list-item">
                <span>{p.name} - {p.price.toLocaleString()} د.ع</span>
                <button className="btn btn-danger btn-icon" onClick={() => onDeleteProduct(p.id)}>
                    <span className="material-icons">delete</span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="admin-panel">
          <h3>إدارة الطلبات</h3>
           <ul className="admin-list">
            {initialOrders.map(order => (
              <li key={order.id} className="admin-list-item">
                <span>طلب #{order.id} - {order.customer}</span>
                <span>{order.status}</span>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="admin-panel">
          <h3>إدارة الشركاء</h3>
          <form onSubmit={handlePartnerSubmit}>
            <div className="form-group">
              <label>اسم الشريك</label>
              <input type="text" value={newPartnerName} onChange={e => setNewPartnerName(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>شعار الشريك (اللوقو)</label>
              <input type="file" accept="image/*" onChange={handleLogoUpload} required />
              {newPartnerLogo && <img src={newPartnerLogo} alt="Preview" className="image-preview" />}
            </div>
            <button type="submit" className="btn btn-primary">إضافة شريك</button>
          </form>
          <hr style={{margin: '30px 0'}}/>
          <h4>الشركاء الحاليون</h4>
          <ul className="admin-list">
            {partners.map(p => (
              <li key={p.id} className="admin-list-item">
                <span>{p.name}</span>
                <button className="btn btn-danger btn-icon" onClick={() => onDeletePartner(p.id)}>
                    <span className="material-icons">delete</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};


// --- MAIN APP COMPONENT ---
const App = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeView, setActiveView] = useState('home'); // 'home', 'cart', 'saved'
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [savedItems, setSavedItems] = useState<Product[]>([]);
  const [partners, setPartners] = useState<Partner[]>(initialPartners);
  
  useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
          setUser(currentUser);
          setLoadingAuth(false);
          setIsAdmin(false); // Reset admin mode on user change
      });
      return () => unsubscribe();
  }, []);

  const handleLogin = async (email: string, pass: string) => {
      setLoadingAuth(true);
      setAuthError(null);
      try {
          await signInWithEmailAndPassword(auth, email, pass);
      } catch (error: any) {
          if (error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
              setAuthError('البريد الإلكتروني أو كلمة المرور غير صحيحة.');
          } else {
              setAuthError('حدث خطأ ما. يرجى المحاولة مرة أخرى.');
          }
      } finally {
          setLoadingAuth(false);
      }
  }

  const handleSignUp = async (email: string, pass: string) => {
      setLoadingAuth(true);
      setAuthError(null);
      try {
          await createUserWithEmailAndPassword(auth, email, pass);
      } catch (error: any) {
          if (error.code === 'auth/email-already-in-use') {
              setAuthError('هذا البريد الإلكتروني مستخدم بالفعل.');
          } else if (error.code === 'auth/weak-password') {
              setAuthError('كلمة المرور يجب أن تتكون من 6 أحرف على الأقل.');
          } else {
              setAuthError('حدث خطأ ما. يرجى المحاولة مرة أخرى.');
          }
      } finally {
          setLoadingAuth(false);
      }
  }

  const handleLogout = async () => {
      await signOut(auth);
  }

  const handleAddToCart = (product: Product) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };
  
  const handleRemoveFromCart = (id: number) => {
      setCartItems(prev => prev.filter(item => item.id !== id));
  }

  const handleToggleSaved = (product: Product) => {
    setSavedItems(prev => {
        const isSaved = prev.some(item => item.id === product.id);
        if(isSaved) {
            return prev.filter(item => item.id !== product.id);
        }
        return [...prev, product];
    })
  }
  
  const handleAddProduct = (productData: Omit<Product, 'id'>) => {
      const newProduct: Product = {
          id: Date.now(),
          ...productData
      };
      setProducts(prev => [newProduct, ...prev]);
  }

  const handleDeleteProduct = (id: number) => {
      setProducts(prev => prev.filter(p => p.id !== id));
  }
  
  const handleAddPartner = (partnerData: Omit<Partner, 'id'>) => {
      const newPartner: Partner = {
          id: Date.now(),
          ...partnerData
      };
      setPartners(prev => [newPartner, ...prev]);
  }

  const handleDeletePartner = (id: number) => {
      setPartners(prev => prev.filter(p => p.id !== id));
  }

  const renderContent = () => {
    if (isAdmin) {
      return <AdminDashboard 
                products={products} 
                onAddProduct={handleAddProduct} 
                onDeleteProduct={handleDeleteProduct}
                partners={partners}
                onAddPartner={handleAddPartner}
                onDeletePartner={handleDeletePartner}
             />;
    }
    switch (activeView) {
      case 'cart':
        return <CartPage cartItems={cartItems} onRemoveFromCart={handleRemoveFromCart}/>;
      case 'saved':
        return <SavedPage savedItems={savedItems} onToggleSaved={handleToggleSaved} onAddToCart={handleAddToCart}/>;
      case 'home':
      default:
        return (
            <>
                <ProductList products={products} onAddToCart={handleAddToCart} onToggleSaved={handleToggleSaved} savedItems={savedItems}/>
                <PartnersSection partners={partners} />
            </>
        );
    }
  };
  
  const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);
  
  if (loadingAuth && !user) {
      return <div className="login-container"><div className="login-form-container"><h2>جاري التحميل...</h2></div></div>
  }

  if (!user) {
      return <LoginPage onLogin={handleLogin} onSignUp={handleSignUp} error={authError} loading={loadingAuth} />
  }

  return (
    <>
      <Header
        isAdmin={isAdmin}
        onToggleAdmin={() => setIsAdmin(!isAdmin)}
        cartCount={cartCount}
        savedCount={savedItems.length}
        activeView={activeView}
        setActiveView={setActiveView}
        user={user}
        onLogout={handleLogout}
      />
      <main>
        <div className="app-container">
            {renderContent()}
        </div>
      </main>
    </>
  );
};

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(<App />);