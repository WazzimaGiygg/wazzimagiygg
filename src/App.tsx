import React, { useEffect, useState, useMemo } from "react";
import { onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
import DOMPurify from "dompurify";
import { 
  Newspaper, 
  BookOpen, 
  Book, 
  GraduationCap, 
  Globe, 
  User, 
  Mail, 
  Calendar, 
  Eye, 
  LogOut, 
  LogIn, 
  Search, 
  Bell, 
  ShieldAlert, 
  Scale, 
  FileText, 
  Monitor, 
  AlertCircle, 
  ArrowLeft, 
  CheckCircle,
  X,
  BellRing
} from "lucide-react";
import { 
  auth, 
  googleProvider, 
  registerUser, 
  checkIfUserIsBanned, 
  checkIfUserIsAdmin, 
  loadCollectionContent, 
  incrementArticleViews, 
  setupNotificationsListener, 
  markNotificationAsRead, 
  markAllNotificationsAsRead, 
  Article, 
  UserNotification 
} from "./firebase";

export default function App() {
  // Authentication & Role States
  const [user, setUser] = useState<any | null>(null);
  const [isGuestUser, setIsGuestUser] = useState(false);
  const [isBanned, setIsBanned] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [banReason, setBanReason] = useState("Violação das políticas de uso");

  // App Content States
  const [currentTab, setCurrentTab] = useState("wikiworldweb");
  const [allItems, setAllItems] = useState<{ [key: string]: Article[] }>({
    wikiworldweb: [],
    materiadeensaio: [],
    academico: [],
    materia: [],
    uwgbooks: []
  });
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Notifications State
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [isNotifDropdownOpen, setIsNotifDropdownOpen] = useState(false);

  // Layout & UI States
  const [isLoading, setIsLoading] = useState(true);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; isError: boolean } | null>(null);

  // Formatted Current Date for the Newspaper Header
  const formattedDate = useMemo(() => {
    return new Date().toLocaleDateString("pt-BR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  }, []);

  // Show Toast Function
  const showToast = (message: string, isError = false) => {
    setToast({ message, isError });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // ============================================
  // AUTHENTICATION LOGIC
  // ============================================
  const generateGuestUID = () => {
    return "convid_" + Math.random().toString(36).substring(2, 15);
  };

  const handleCreateGuestUser = () => {
    const guestUID = generateGuestUID();
    const expiry = Date.now() + (24 * 60 * 60 * 1000);
    const guestData = { 
      uid: guestUID, 
      displayName: "Convidado", 
      email: `${guestUID}@guest.local`, 
      isGuest: true 
    };
    localStorage.setItem("wzzm_guest_user", JSON.stringify(guestData));
    localStorage.setItem("wzzm_guest_expiry", expiry.toString());
    return guestData;
  };

  const getStoredGuestUser = () => {
    const expiry = localStorage.getItem("wzzm_guest_expiry");
    if (expiry && Date.now() < parseInt(expiry)) {
      const stored = localStorage.getItem("wzzm_guest_user");
      if (stored) return JSON.parse(stored);
    }
    return null;
  };

  const clearGuestUser = () => {
    localStorage.removeItem("wzzm_guest_user");
    localStorage.removeItem("wzzm_guest_expiry");
  };

  // Check auth and initial setup
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setIsGuestUser(false);
        clearGuestUser();

        // Verify if user is banned
        const bannedStatus = await checkIfUserIsBanned(currentUser.uid);
        setIsBanned(bannedStatus);

        // Verify if admin
        const adminStatus = await checkIfUserIsAdmin(currentUser.uid);
        setIsAdmin(adminStatus);

        // Register user
        await registerUser(currentUser, false);

        setUser(currentUser);
        
        if (bannedStatus) {
          setIsLoading(false);
          return;
        }

        // Setup real-time notifications
        const unsubscribeNotifs = setupNotificationsListener(currentUser.uid, (notifs) => {
          setNotifications(notifs);
        });

        // Load content
        await loadAllContent();
        setIsLoading(false);

        return () => {
          unsubscribeNotifs();
        };
      } else {
        // Fallback to guest user checking
        const storedGuest = getStoredGuestUser();
        if (storedGuest) {
          setUser(storedGuest);
          setIsGuestUser(true);
        } else {
          setUser(null);
          setIsGuestUser(false);
        }
        setIsBanned(false);
        setIsAdmin(false);
        setNotifications([]);
        await loadAllContent();
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Fetch all categories
  const loadAllContent = async () => {
    try {
      const [wikiworld, ensaio, academico, materia, uwgbooks] = await Promise.all([
        loadCollectionContent("wikiworldweb").catch(() => []),
        loadCollectionContent("materiadeensaio").catch(() => []),
        loadCollectionContent("academico").catch(() => []),
        loadCollectionContent("materia").catch(() => []),
        loadCollectionContent("uwgbooks").catch(() => [])
      ]);

      setAllItems({
        wikiworldweb: wikiworld,
        materiadeensaio: ensaio,
        academico: academico,
        materia: materia,
        uwgbooks: uwgbooks
      });
    } catch (err) {
      console.error("Error loading content:", err);
      showToast("Não foi possível carregar alguns conteúdos.", true);
    }
  };

  // Login handler
  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user) {
        setIsLoginModalOpen(false);
        showToast("Login efetuado com sucesso!");
      }
    } catch (err: any) {
      console.error(err);
      showToast("Falha na autenticação com o Google: " + err.message, true);
    }
  };

  // Guest login handler
  const handleGuestLogin = async () => {
    try {
      const guestData = handleCreateGuestUser();
      setUser(guestData);
      setIsGuestUser(true);
      await registerUser(guestData, true);
      setIsLoginModalOpen(false);
      showToast("Acesso convidado liberado!");
      window.location.reload(); // Reload to refresh contexts perfectly
    } catch (err: any) {
      console.error(err);
      showToast("Falha ao iniciar acesso convidado.", true);
    }
  };

  // Logout handler
  const handleLogout = async () => {
    try {
      clearGuestUser();
      if (auth.currentUser) {
        await signOut(auth);
      }
      setUser(null);
      setIsGuestUser(false);
      setIsAdmin(false);
      setNotifications([]);
      showToast("Sessão encerrada com sucesso.");
      window.location.reload();
    } catch (err: any) {
      showToast("Erro ao deslogar: " + err.message, true);
    }
  };

  // ============================================
  // CONTENT MANAGEMENT & VIEWS
  // ============================================
  const handleSelectArticle = async (article: Article) => {
    setSelectedArticle(article);
    // Scroll to content top
    window.scrollTo({ top: 180, behavior: "smooth" });

    // Try to register visual views increment
    if (!isGuestUser && user) {
      try {
        await incrementArticleViews(article.colecao, article.id);
        // Sync locally so the counter updates in client immediately without full reload
        setAllItems(prev => {
          const cat = prev[article.colecao];
          const updated = cat.map(item => {
            if (item.id === article.id) {
              return { ...item, visualizacoes: (item.visualizacoes || 0) + 1 };
            }
            return item;
          });
          return { ...prev, [article.colecao]: updated };
        });
      } catch (e) {
        console.warn("View increment blocked:", e);
      }
    }
  };

  // ============================================
  // HELPERS
  // ============================================
  const getInitials = (name: string) => {
    if (!name) return "👤";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const cleanTextExcerpt = (html: string, maxLength: number) => {
    if (!html) return "";
    // Remove tags
    const cleanStr = html.replace(/<[^>]*>/g, "");
    if (cleanStr.length > maxLength) {
      return cleanStr.substring(0, maxLength) + "...";
    }
    return cleanStr;
  };

  const getTabLabel = (tab: string) => {
    const labels: { [key: string]: string } = {
      wikiworldweb: "WikiWorld",
      materiadeensaio: "Notícia",
      academico: "Acadêmico",
      materia: "Matéria",
      uwgbooks: "UWG Book"
    };
    return labels[tab] || "Conteúdo";
  };

  const getTabIcon = (tab: string) => {
    switch (tab) {
      case "wikiworldweb": return <Globe className="w-4 h-4" />;
      case "materiadeensaio": return <Newspaper className="w-4 h-4" />;
      case "academico": return <GraduationCap className="w-4 h-4" />;
      case "materia": return <BookOpen className="w-4 h-4" />;
      case "uwgbooks": return <Book className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const formatDateString = (timestamp: any) => {
    if (!timestamp) return "Data recente";
    if (timestamp.toDate) return timestamp.toDate().toLocaleDateString("pt-BR");
    if (timestamp instanceof Date) return timestamp.toLocaleDateString("pt-BR");
    return new Date(timestamp).toLocaleDateString("pt-BR");
  };

  const formatDateTimeString = (timestamp: any) => {
    if (!timestamp) return "Data recente";
    if (timestamp.toDate) return timestamp.toDate().toLocaleString("pt-BR");
    if (timestamp instanceof Date) return timestamp.toLocaleString("pt-BR");
    return new Date(timestamp).toLocaleString("pt-BR");
  };

  // Handle outside click to close dropdowns
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".notif-bell-container")) {
        setIsNotifDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  // Filter items matching the search term
  const filteredItems = useMemo(() => {
    const tabArticles = allItems[currentTab] || [];
    if (!searchTerm.trim()) return tabArticles;

    const term = searchTerm.toLowerCase().trim();
    return tabArticles.filter(item => 
      item.titulo.toLowerCase().includes(term) ||
      cleanTextExcerpt(item.descricao, 9999).toLowerCase().includes(term)
    );
  }, [allItems, currentTab, searchTerm]);

  // Split filtered items into Column components
  const displayArticles = useMemo(() => {
    if (filteredItems.length === 0) return { spotlight: null, left: [], right: [] };
    const spotlight = filteredItems[0];
    const left = filteredItems.slice(1, 4);
    const right = filteredItems.slice(4, 8);
    return { spotlight, left, right };
  }, [filteredItems]);

  const unreadNotificationsCount = useMemo(() => {
    return notifications.filter(n => !n.lida).length;
  }, [notifications]);

  // Sanitize the HTML Content for premium layout rendering
  const renderSafeHtml = (rawHtml: string) => {
    if (!rawHtml) return { __html: "<p class='text-stone-500 italic'>Sem conteúdo para exibição.</p>" };
    const cleanHtml = DOMPurify.sanitize(rawHtml, {
      ALLOWED_TAGS: [
        "h1", "h2", "h3", "h4", "h5", "h6", "p", "br", "hr", "b", "i", "strong", "em",
        "ul", "ol", "li", "a", "img", "table", "thead", "tbody", "tr", "th", "td",
        "pre", "code", "blockquote", "div", "span", "figure", "figcaption"
      ],
      ALLOWED_ATTR: ["href", "src", "alt", "title", "class", "id", "width", "height", "target", "rel"]
    });
    return { __html: cleanHtml };
  };

  // ============================================
  // COMPONENT RENDERS
  // ============================================
  return (
    <div className="min-h-screen bg-[#E4E3E0] font-sans text-[#141414] selection:bg-[#D4D3D0] selection:text-[#141414]">
      
      {/* 1. BANNED BLOCK-OUT OVERLAY */}
      {isBanned && (
        <div className="fixed inset-0 bg-stone-950/90 z-[9999] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#EBEAE8] border-4 border-[#141414] rounded-none p-8 max-w-md w-full text-center shadow-[8px_8px_0px_0px_rgba(20,20,20,1)] relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-1 bg-[#141414]"></div>
            <div className="w-16 h-16 bg-[#DCDAD7] border border-[#141414] rounded-none flex items-center justify-center mx-auto mb-6 text-[#141414] shadow-inner">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-serif font-extrabold text-[#141414] mb-2 tracking-tight uppercase">
              ⚠️ Conta Suspensa
            </h2>
            <p className="text-[#141414]/85 text-xs leading-relaxed mb-6">
              Sua conta de usuário foi banida permanentemente de nosso portal por violação das políticas de uso e diretrizes comunitárias.
            </p>
            <div className="bg-[#E4E3E0] border border-[#141414] rounded-none p-4 mb-6 text-left">
              <span className="text-[10px] font-mono font-bold text-[#141414]/60 uppercase tracking-widest block mb-1">Motivo do Banimento</span>
              <p className="text-[#141414] text-sm font-serif italic">"{banReason}"</p>
            </div>
            <button 
              onClick={handleLogout}
              className="w-full bg-[#141414] hover:bg-[#D4D3D0] hover:text-[#141414] text-[#E4E3E0] border border-[#141414] font-mono text-xs font-bold uppercase tracking-wider py-3 px-6 rounded-none transition-all active:scale-[0.98] cursor-pointer"
            >
              Sair da Conta
            </button>
          </div>
        </div>
      )}

      {/* 2. CUSTOM TOAST */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[3000] flex items-center gap-3 bg-[#141414] text-[#E4E3E0] border-2 border-[#141414] py-3 px-5 rounded-none shadow-[4px_4px_0px_0px_rgba(228,227,224,1)] max-w-sm animate-slide-up font-mono text-xs">
          {toast.isError ? (
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          ) : (
            <CheckCircle className="w-4 h-4 text-green-400 shrink-0" />
          )}
          <span className="tracking-wide font-bold">{toast.message}</span>
        </div>
      )}

      {/* 3. TOP NAVIGATION UNIFIED HEADER */}
      <header className="bg-[#141414] border-b border-[#141414] text-[#E4E3E0] sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          
          {/* Logo brand click to reload */}
          <div 
            onClick={() => { setSelectedArticle(null); setSearchTerm(""); }} 
            className="flex items-center gap-2.5 cursor-pointer hover:opacity-90 active:scale-95 transition-all"
          >
            <img 
              src="https://wazzimagiygg.com/favicom.png" 
              alt="Logo WazzimaGiygg" 
              className="h-8 w-8 rounded-none bg-[#E4E3E0] border border-[#141414] p-0.5 object-contain"
              onError={(e) => {
                // Fallback image in case the target drops
                (e.target as HTMLImageElement).src = "https://gspotfverwazzimagiygg.wazzimagiygg.com/favicom.png";
              }}
            />
            <div>
              <h1 className="font-serif font-extrabold text-sm leading-none tracking-wider uppercase">
                Wazzima<span className="text-red-500">Giygg</span>
              </h1>
              <span className="text-[9px] text-[#E4E3E0]/70 font-mono uppercase tracking-widest leading-none block mt-0.5">
                Inevitável!
              </span>
            </div>
          </div>

          {/* User profile, notifications, login block */}
          <div className="flex items-center gap-4">
            
            {user ? (
              <div className="flex items-center gap-3">
                
                {/* Notification Bell */}
                <div className="relative notif-bell-container">
                  <button 
                    onClick={() => setIsNotifDropdownOpen(!isNotifDropdownOpen)}
                    className="p-2 text-[#E4E3E0]/80 hover:text-white hover:bg-stone-800 rounded-none transition-all relative cursor-pointer"
                    aria-label="Notificações"
                  >
                    <Bell className="w-4 h-4" />
                    {unreadNotificationsCount > 0 && (
                      <span className="absolute top-1 right-1 w-4 h-4 bg-red-600 text-white font-mono font-bold text-[8px] rounded-none flex items-center justify-center border border-[#141414]">
                        {unreadNotificationsCount > 99 ? "99+" : unreadNotificationsCount}
                      </span>
                    )}
                  </button>

                  {/* Dropdown Drawer */}
                  {isNotifDropdownOpen && (
                    <div className="absolute right-0 mt-2.5 w-80 md:w-96 bg-[#EBEAE8] border border-[#141414] rounded-none shadow-[6px_6px_0px_0px_rgba(20,20,20,1)] text-[#141414] overflow-hidden animate-slide-down">
                      <div className="bg-[#141414] text-[#E4E3E0] p-3.5 flex items-center justify-between border-b border-[#141414]">
                        <div className="flex items-center gap-2">
                          <BellRing className="w-4 h-4 text-green-500" />
                          <h3 className="text-xs font-mono font-bold uppercase tracking-wider">Notificações</h3>
                        </div>
                        {unreadNotificationsCount > 0 && (
                          <button 
                            onClick={() => markAllNotificationsAsRead(notifications)}
                            className="text-[10px] font-mono font-bold text-[#E4E3E0] hover:text-[#DCDAD7] transition-colors cursor-pointer uppercase tracking-wider"
                          >
                            Limpar todas
                          </button>
                        )}
                      </div>

                      <div className="max-h-[320px] overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="p-8 text-center text-stone-500 font-mono text-xs">
                            <Bell className="w-6 h-6 mx-auto text-stone-400 mb-2 opacity-50" />
                            <p>Nenhuma notificação encontrada.</p>
                          </div>
                        ) : (
                          <div className="divide-y divide-[#141414]/10">
                            {notifications.map((notif) => (
                              <div 
                                key={notif.id}
                                onClick={async () => {
                                  if (!notif.lida) await markNotificationAsRead(notif.id);
                                }}
                                className={`p-4 transition-colors cursor-pointer hover:bg-[#DCDAD7] text-left ${!notif.lida ? "bg-[#DCDAD7]/40 border-l-4 border-[#141414]" : ""}`}
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <h4 className="text-xs font-bold font-mono uppercase tracking-wide text-stone-900">{notif.titulo}</h4>
                                  {!notif.lida && <span className="w-1.5 h-1.5 rounded-none bg-red-600 shrink-0 mt-1"></span>}
                                </div>
                                <p className="text-xs text-stone-700 mt-1 leading-relaxed font-sans">{notif.mensagem}</p>
                                <span className="text-[9px] font-mono text-stone-500 block mt-2">
                                  {formatDateTimeString(notif.timestamp)}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Vertical Separator */}
                <div className="w-px h-5 bg-stone-800"></div>

                {/* User Card */}
                <div className="flex items-center gap-3">
                  <div className="text-right hidden sm:block">
                    <div className="text-xs font-bold tracking-wide flex items-center justify-end gap-1.5">
                      <span>{user.displayName || user.name || "Leitor"}</span>
                      {isAdmin && <span className="text-[8px] font-mono bg-red-600 text-white font-bold px-1.5 py-0.5 uppercase tracking-wider">Admin</span>}
                      {isGuestUser && <span className="text-[8px] font-mono bg-[#DCDAD7] text-[#141414] font-bold px-1.5 py-0.5 uppercase tracking-wider">Visitante</span>}
                    </div>
                    <span className="text-[9px] text-[#E4E3E0]/70 font-mono block mt-0.5">{user.email || "Sem e-mail"}</span>
                  </div>

                  {/* Avatar */}
                  <div className="w-8 h-8 rounded-none bg-[#EBEAE8] border border-[#141414] flex items-center justify-center text-xs font-bold uppercase text-[#141414] shadow-inner overflow-hidden select-none">
                    {user.photoURL || user.profilePictureUrl ? (
                      <img 
                        src={user.photoURL || user.profilePictureUrl} 
                        alt="Avatar" 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Fallback to initials
                          (e.target as HTMLElement).style.display = "none";
                        }}
                      />
                    ) : getInitials(user.displayName || user.name)}
                  </div>

                  {/* Logout Button */}
                  <button 
                    onClick={handleLogout}
                    className="p-1.5 bg-stone-800 hover:bg-red-950 hover:text-red-400 text-[#E4E3E0] border border-stone-700 rounded-none transition-colors cursor-pointer"
                    title="Encerrar Sessão"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>

              </div>
            ) : (
              <button 
                onClick={() => setIsLoginModalOpen(true)}
                className="bg-[#141414] hover:bg-[#DCDAD7] hover:text-[#141414] text-[#E4E3E0] font-mono text-xs font-bold py-2 px-4 rounded-none border border-[#141414] flex items-center gap-2 transition-all active:scale-95 cursor-pointer uppercase tracking-wider"
              >
                <User className="w-3.5 h-3.5" /> Entrar
              </button>
            )}

          </div>

        </div>
      </header>

      {/* 4. THE EDITORIAL NEWSPAPER MASTHEAD */}
      <div className="bg-[#EBEAE8] border-b-4 border-[#141414] border-x border-[#141414] pt-8 pb-5 text-center px-4 relative max-w-7xl mx-auto mt-4">
        <div className="max-w-4xl mx-auto flex flex-col items-center">
          
          {/* Logo Header click to reset */}
          <div 
            onClick={() => { setSelectedArticle(null); setSearchTerm(""); }}
            className="cursor-pointer select-none group"
          >
            <div className="flex items-center justify-center gap-4">
              <img 
                src="https://wazzimagiygg.com/favicom.png" 
                alt="WazzimaGiygg Emblem" 
                className="h-12 w-12 object-contain rounded-none border border-[#141414] bg-white p-0.5 group-hover:rotate-6 transition-transform"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "https://gspotfverwazzimagiygg.wazzimagiygg.com/favicom.png";
                }}
              />
              <h1 className="font-serif font-black text-4xl sm:text-5xl md:text-6xl text-[#141414] tracking-tight leading-none uppercase">
                Wazzima<span className="text-red-700 transition-colors group-hover:text-red-600">Giygg</span>
              </h1>
            </div>
            <p className="text-stone-600 font-serif italic text-xs sm:text-sm mt-1.5 tracking-widest uppercase font-bold">
              Inevitável!
            </p>
          </div>

          {/* Newspaper motto lines */}
          <div className="w-full max-w-lg border-y border-[#141414] py-2.5 my-5">
            <p className="font-serif font-medium italic text-stone-800 text-xs sm:text-sm tracking-wide">
              "Όχι, ο Χρόνος δεν είναι ο άρχοντας της γνώσης!"
            </p>
          </div>

          {/* Issue meta details */}
          <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px] text-[#141414] font-mono font-bold tracking-widest uppercase border-b border-[#141414]/20 pb-2">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#141414] shrink-0" />
              <span>{formattedDate}</span>
            </div>
            <div className="hidden sm:block text-[#141414]/30">|</div>
            <div className="flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-stone-500 shrink-0" />
              <span>Edição Santa Fé do Sul</span>
            </div>
          </div>

          {/* Search container */}
          <div className="w-full max-w-md relative mt-4">
            <input 
              type="text"
              placeholder="Buscar artigos, notícias e matérias..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#E4E3E0] border border-[#141414] rounded-none py-2.5 pl-5 pr-12 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-[#141414] focus:border-[#141414] focus:bg-white transition-all"
            />
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-[#141414]">
              <Search className="w-4 h-4" />
            </div>
          </div>

        </div>
      </div>

      {/* 5. STICKY SUB CATEGORY NAV MENU */}
      <nav className="bg-[#EBEAE8] border-b border-[#141414] border-x border-[#141414] text-[#141414] sticky top-[56px] z-40 shadow-sm max-w-7xl mx-auto">
        <div className="max-w-4xl mx-auto px-2">
          <ul className="flex items-center justify-center overflow-x-auto no-scrollbar scroll-smooth">
            {[
              { id: "wikiworldweb", label: "WIKIWORLD" },
              { id: "materiadeensaio", label: "NOTÍCIAS" },
              { id: "academico", label: "ACADÊMICO" },
              { id: "materia", label: "MATÉRIAS" },
              { id: "uwgbooks", label: "UWG BOOKS" }
            ].map((tab) => {
              const active = currentTab === tab.id;
              return (
                <li key={tab.id} className="shrink-0 border-r border-[#141414]/20 last:border-r-0">
                  <button 
                    onClick={() => {
                      setCurrentTab(tab.id);
                      setSelectedArticle(null);
                    }}
                    className={`px-5 py-3.5 text-xs font-mono font-bold tracking-wider uppercase transition-all flex items-center gap-2 cursor-pointer ${
                      active 
                        ? "bg-[#141414] text-[#E4E3E0]" 
                        : "text-[#141414] hover:bg-[#DCDAD7]"
                    }`}
                  >
                    {getTabIcon(tab.id)}
                    <span>{tab.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>

      {/* 6. REAL-TIME PUBLICATION STATS COUNTER BAR */}
      <div className="bg-[#DCDAD7] border-b border-x border-[#141414] py-3.5 px-4 shadow-sm max-w-7xl mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { id: "wikiworldweb", label: "WikiWorld", color: "border-[#141414]" },
            { id: "materiadeensaio", label: "Notícias", color: "border-red-600" },
            { id: "academico", label: "Acadêmico", color: "border-green-600" },
            { id: "materia", label: "Matérias", color: "border-amber-600" },
            { id: "uwgbooks", label: "UWG Books", color: "border-indigo-600" }
          ].map((stat) => (
            <div 
              key={stat.id}
              onClick={() => {
                setCurrentTab(stat.id);
                setSelectedArticle(null);
              }}
              className={`bg-white hover:bg-[#EBEAE8] border border-[#141414] border-l-4 ${stat.color} p-2.5 px-4 text-left cursor-pointer transition-all hover:translate-y-[-1px] ${currentTab === stat.id ? "ring-2 ring-[#141414] bg-[#EBEAE8]" : ""}`}
            >
              <div className="text-[#141414]/60 font-mono font-bold text-[9px] uppercase tracking-wider">{stat.label}</div>
              <div className="text-lg font-serif font-black text-[#141414] mt-0.5 leading-none">
                {allItems[stat.id]?.length || 0}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 7. MAIN AREA CONTROLLER */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {isLoading ? (
          <div className="py-24 text-center">
            <div className="w-12 h-12 border-4 border-[#DCDAD7] border-t-[#141414] rounded-none animate-spin mx-auto mb-4"></div>
            <p className="text-stone-600 font-serif italic text-xs uppercase tracking-widest">Carregando acervo editorial...</p>
          </div>
        ) : selectedArticle ? (
          
          /* 7A. DETAILED ARTICLE VIEW */
          <article className="max-w-4xl mx-auto bg-white border border-stone-200 rounded-xl shadow-md overflow-hidden animate-fade-in">
            
            {/* Top red accent line */}
            <div className="h-2 bg-[#141414] w-full"></div>

            <div className="p-6 sm:p-10">
              
              {/* Back button */}
              <button 
                onClick={() => setSelectedArticle(null)}
                className="inline-flex items-center gap-2 text-stone-600 hover:text-[#141414] font-mono font-bold text-xs uppercase tracking-wider mb-8 transition-colors cursor-pointer group"
              >
                <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" /> Voltar ao Acervo
              </button>

              <header className="mb-8 border-b border-[#141414]/20 pb-6">
                {/* Category tags */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="bg-[#DCDAD7] text-[#141414] text-[10px] font-mono font-extrabold px-2.5 py-1 rounded-none uppercase tracking-wider border border-[#141414]">
                    {getTabLabel(selectedArticle.colecao)}
                  </span>
                  <span className="text-[#141414]/45 text-xs">•</span>
                  <span className="text-stone-600 text-[11px] font-mono font-bold uppercase tracking-wider">
                    {selectedArticle.setor}
                  </span>
                </div>

                <h2 className="text-2xl sm:text-3.5xl font-serif font-black text-[#141414] tracking-tight leading-tight mb-4">
                  {selectedArticle.titulo}
                </h2>

                {/* Editorial Metadata card */}
                <div className="bg-[#EBEAE8] border border-[#141414] rounded-none p-4 sm:p-5 mt-6 grid grid-cols-2 md:grid-cols-3 gap-4 text-xs font-mono">
                  <div>
                    <span className="text-stone-500 font-bold block uppercase text-[10px] tracking-wider mb-1">Autor / Redação</span>
                    <div className="flex items-center gap-1.5 text-[#141414] font-bold">
                      <User className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                      <span>{selectedArticle.criadorEmail}</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-stone-500 font-bold block uppercase text-[10px] tracking-wider mb-1">Publicado</span>
                    <div className="flex items-center gap-1.5 text-[#141414] font-bold">
                      <Calendar className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                      <span>{formatDateTimeString(selectedArticle.dataCriacao)}</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-stone-500 font-bold block uppercase text-[10px] tracking-wider mb-1">Visualizações</span>
                    <div className="flex items-center gap-1.5 text-[#141414] font-bold">
                      <Eye className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                      <span>{(selectedArticle.visualizacoes || 0).toLocaleString()} views</span>
                    </div>
                  </div>
                  {selectedArticle.ultimaEdicao && (
                    <div className="col-span-2 md:col-span-3 pt-3 border-t border-[#141414]/10">
                      <span className="text-stone-500 font-bold uppercase text-[9px] tracking-wider mr-1.5">Última Edição:</span>
                      <span className="text-[#141414] font-mono text-[11px] font-medium">{formatDateTimeString(selectedArticle.ultimaEdicao)}</span>
                    </div>
                  )}
                </div>
              </header>

              {/* ARTICLE SANITIZED BODY */}
              <div 
                className="font-serif text-[#141414] text-base sm:text-lg leading-relaxed space-y-6 text-justify break-words prose max-w-none
                  prose-headings:font-serif prose-headings:text-[#141414] prose-headings:tracking-tight
                  prose-h1:text-2xl prose-h1:font-black prose-h1:mt-8 prose-h1:border-b-2 prose-h1:border-[#141414] prose-h1:pb-2
                  prose-h2:text-xl prose-h2:font-bold prose-h2:mt-6
                  prose-p:text-justify prose-p:my-4
                  prose-a:text-[#141414] prose-a:underline hover:prose-a:text-stone-600
                  prose-img:rounded-none prose-img:border prose-img:border-[#141414] prose-img:shadow-[4px_4px_0px_0px_rgba(20,20,20,1)] prose-img:my-6 prose-img:mx-auto
                  prose-blockquote:border-l-4 prose-blockquote:border-[#141414] prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-stone-700 prose-blockquote:my-6
                  prose-table:w-full prose-table:border-collapse prose-table:my-6
                  prose-th:border prose-th:border-[#141414] prose-th:p-2.5 prose-th:bg-[#EBEAE8] prose-th:font-serif
                  prose-td:border prose-td:border-[#141414] prose-td:p-2.5"
                dangerouslySetInnerHTML={renderSafeHtml(selectedArticle.descricao)}
              />

              <div className="mt-12 pt-8 border-t border-[#141414]/20 flex justify-between items-center flex-wrap gap-4">
                <button 
                  onClick={() => setSelectedArticle(null)}
                  className="bg-[#141414] hover:bg-[#DCDAD7] hover:text-[#141414] text-[#E4E3E0] border border-[#141414] font-mono text-xs font-bold py-3 px-6 rounded-none transition-all cursor-pointer"
                >
                  ← Voltar ao Acervo
                </button>
                <div className="text-[10px] text-stone-500 font-mono font-bold tracking-widest uppercase">
                  WazzimaGiygg - Inevitável!
                </div>
              </div>

            </div>
          </article>

        ) : filteredItems.length === 0 ? (
          
          /* 7B. EMPTY STATE */
          <div className="bg-[#EBEAE8] border-2 border-[#141414] rounded-none p-16 text-center shadow-[6px_6px_0px_0px_rgba(20,20,20,1)] max-w-xl mx-auto animate-fade-in">
            <Newspaper className="w-12 h-12 text-[#141414]/40 mx-auto mb-4" />
            <h3 className="text-lg font-serif font-black text-[#141414] mb-1 uppercase">
              Nenhuma publicação encontrada
            </h3>
            <p className="text-stone-600 text-sm leading-relaxed max-w-md mx-auto">
              Não encontramos nenhuma matéria correspondente aos filtros de busca em <span className="font-bold">"{getTabLabel(currentTab)}"</span>. Experimente outro termo de busca ou tab.
            </p>
            <button 
              onClick={() => { setSearchTerm(""); setSelectedArticle(null); }}
              className="mt-6 bg-[#141414] hover:bg-[#DCDAD7] hover:text-[#141414] text-[#E4E3E0] border border-[#141414] font-mono text-xs font-bold py-2.5 px-5 rounded-none transition-all cursor-pointer"
            >
              Limpar Busca
            </button>
          </div>

        ) : (
          
          /* 7C. MULTI COLUMN NEWSPAPER LAYOUT */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fade-in">
            
            {/* COLUMN 1: LEFT SIDEBAR (Articles 2-4) */}
            <aside className="lg:col-span-3 order-2 lg:order-1 flex flex-col gap-6">
              <div className="border-b-2 border-[#141414] pb-1.5 mb-2">
                <h3 className="font-mono font-bold text-xs uppercase tracking-widest text-[#141414]">
                  Mais Lidas / Ensaios
                </h3>
              </div>

              {displayArticles.left.length === 0 ? (
                <div className="bg-white border border-dashed border-[#141414]/30 p-6 rounded-none text-center text-xs text-stone-500 font-mono italic">
                  Aguardando novos artigos adicionais...
                </div>
              ) : (
                <div className="divide-y divide-[#141414]/10">
                  {displayArticles.left.map((item) => (
                    <div key={item.id} className="py-4.5 first:pt-0 last:pb-0">
                      <span className="text-stone-600 font-mono font-bold text-[9px] tracking-wider uppercase block mb-1">
                        {item.setor}
                      </span>
                      <h4 className="font-serif font-bold text-sm text-[#141414] hover:text-stone-600 transition-colors leading-snug">
                        <button 
                          onClick={() => handleSelectArticle(item)}
                          className="text-left cursor-pointer focus:outline-none hover:underline"
                        >
                          {item.titulo}
                        </button>
                      </h4>
                      <div className="flex items-center gap-1.5 text-[9px] text-stone-500 font-mono font-bold uppercase tracking-wider mt-2">
                        <span>{formatDateString(item.ultimaEdicao)}</span>
                        <span>•</span>
                        <span className="flex items-center gap-0.5"><Eye className="w-2.5 h-2.5" /> {item.visualizacoes || 0}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </aside>

            {/* COLUMN 2: CENTER PIECE (SPOTLIGHT ARTICLE 1) */}
            <section className="lg:col-span-6 order-1 lg:order-2 bg-white border-2 border-[#141414] rounded-none p-6 sm:p-8 shadow-[6px_6px_0px_0px_rgba(20,20,20,1)]">
              <div className="border-b-2 border-[#141414] pb-1.5 mb-5 flex justify-between items-end">
                <h3 className="font-mono font-bold text-xs uppercase tracking-widest text-[#141414]">
                  Notícia de Destaque
                </h3>
                <span className="text-[10px] text-red-600 font-mono font-bold uppercase tracking-widest animate-pulse">• Em evidência</span>
              </div>

              {displayArticles.spotlight && (
                <div className="text-left">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="bg-[#DCDAD7] text-[#141414] text-[9px] font-mono font-extrabold px-2 py-0.5 rounded-none uppercase tracking-wider border border-[#141414]">
                      {getTabLabel(displayArticles.spotlight.colecao)}
                    </span>
                    <span className="text-stone-400 text-xs">•</span>
                    <span className="text-stone-600 text-[10px] font-mono font-bold uppercase tracking-wider">
                      {displayDisplaysetor(displayArticles.spotlight.setor)}
                    </span>
                  </div>

                  <h2 className="font-serif font-black text-2xl sm:text-3xl text-[#141414] tracking-tight leading-tight hover:text-stone-600 transition-colors mb-4">
                    <button 
                      onClick={() => handleSelectArticle(displayArticles.spotlight!)}
                      className="text-left cursor-pointer focus:outline-none hover:underline"
                    >
                      {displayArticles.spotlight.titulo}
                    </button>
                  </h2>

                  <div className="flex items-center gap-3 text-[10px] text-stone-500 font-mono font-bold uppercase tracking-widest border-y border-[#141414]/10 py-2.5 my-4">
                    <span className="flex items-center gap-1"><User className="w-3 h-3" /> {displayArticles.spotlight.criadorEmail?.split("@")[0] || "Redação"}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {formatDateString(displayArticles.spotlight.ultimaEdicao)}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {displayArticles.spotlight.visualizacoes || 0}</span>
                  </div>

                  <p className="font-serif text-stone-800 text-sm leading-relaxed mb-6 text-justify">
                    {cleanTextExcerpt(displayArticles.spotlight.descricao, 380)}
                  </p>

                  <button 
                    onClick={() => handleSelectArticle(displayArticles.spotlight!)}
                    className="inline-flex bg-[#141414] hover:bg-[#DCDAD7] hover:text-[#141414] text-[#E4E3E0] font-mono font-bold text-xs py-2.5 px-5 rounded-none border border-[#141414] uppercase tracking-wider transition-all cursor-pointer"
                  >
                    Ler matéria completa →
                  </button>
                </div>
              )}
            </section>

            {/* COLUMN 3: RIGHT SIDEBAR (Articles 5-8) */}
            <aside className="lg:col-span-3 order-3 flex flex-col gap-6">
              <div className="border-b-2 border-[#141414] pb-1.5 mb-2">
                <h3 className="font-mono font-bold text-xs uppercase tracking-widest text-[#141414]">
                  Mais Publicações
                </h3>
              </div>

              {displayArticles.right.length === 0 ? (
                <div className="bg-white border border-dashed border-[#141414]/30 p-6 rounded-none text-center text-xs text-stone-500 font-mono italic">
                  Novas atualizações acadêmicas em breve...
                </div>
              ) : (
                <div className="divide-y divide-[#141414]/10">
                  {displayArticles.right.map((item) => (
                    <div key={item.id} className="py-4.5 first:pt-0 last:pb-0 text-left">
                      <span className="text-stone-600 font-mono font-bold text-[9px] tracking-wider uppercase block mb-1">
                        {item.setor}
                      </span>
                      <h4 className="font-serif font-bold text-sm text-[#141414] hover:text-stone-600 transition-colors leading-snug">
                        <button 
                          onClick={() => handleSelectArticle(item)}
                          className="text-left cursor-pointer focus:outline-none hover:underline"
                        >
                          {item.titulo}
                        </button>
                      </h4>
                      <div className="flex items-center gap-1.5 text-[9px] text-stone-500 font-mono font-bold uppercase tracking-wider mt-2">
                        <span>{formatDateString(item.ultimaEdicao)}</span>
                        <span>•</span>
                        <span className="flex items-center gap-0.5"><Eye className="w-2.5 h-2.5" /> {item.visualizacoes || 0}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </aside>

          </div>
        )}
      </main>

      {/* 8. DYNAMIC GENERAL LEGAL COMPLIANCE & REPORTS SECTION */}
      <section className="bg-[#DCDAD7] border-t-2 border-[#141414] py-10 px-4 mt-12 shadow-inner">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: LGPD */}
          <div className="bg-white border border-[#141414] rounded-none p-6 shadow-[4px_4px_0px_0px_rgba(20,20,20,1)] flex flex-col justify-between text-left">
            <div>
              <div className="flex items-center gap-2 mb-3 text-stone-900">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <h3 className="font-mono font-bold text-xs uppercase tracking-wider">
                  Segurança LGPD
                </h3>
              </div>
              <p className="text-xs text-stone-700 leading-relaxed mb-4 font-serif">
                Nosso portal respeita integralmente a Lei Geral de Proteção de Dados (Lei nº 13.709/2018), garantindo transparência, sigilo e consentimento sobre as suas informações de acesso.
              </p>
            </div>
            <span className="inline-block self-start text-[9px] font-mono bg-[#EBEAE8] text-[#141414] font-bold px-2.5 py-1 rounded-none uppercase border border-[#141414]">
              ✓ Respeitado
            </span>
          </div>

          {/* Card 2: MARCO CIVIL */}
          <div className="bg-white border border-[#141414] rounded-none p-6 shadow-[4px_4px_0px_0px_rgba(20,20,20,1)] flex flex-col justify-between text-left">
            <div>
              <div className="flex items-center gap-2 mb-3 text-stone-900">
                <Scale className="w-5 h-5 text-blue-600" />
                <h3 className="font-mono font-bold text-xs uppercase tracking-wider">
                  Marco Civil da Internet
                </h3>
              </div>
              <p className="text-xs text-stone-700 leading-relaxed mb-4 font-serif">
                Atuamos em estrita conformidade com os princípios de neutralidade da rede, liberdade de expressão e preservação de registros conforme a Lei nº 12.965/2014.
              </p>
            </div>
            <span className="inline-block self-start text-[9px] font-mono bg-[#EBEAE8] text-[#141414] font-bold px-2.5 py-1 rounded-none uppercase border border-[#141414]">
              ✓ Em conformidade
            </span>
          </div>

          {/* Card 3: WIKIPEDIA RELATÓRIO */}
          <div className="bg-white border border-[#141414] rounded-none p-6 shadow-[4px_4px_0px_0px_rgba(20,20,20,1)] flex flex-col justify-between text-left">
            <div>
              <div className="flex items-center gap-2 mb-3 text-stone-900">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <h3 className="font-mono font-bold text-xs uppercase tracking-wider">
                  Abusos da Wikipédia
                </h3>
              </div>
              <p className="text-xs text-stone-700 leading-relaxed mb-4 font-serif">
                Acesse o dossiê detalhado expondo abusos, perseguições e assédios virtuais que moderadores da Wikipédia aplicaram contra a marca WazzimaGiygg.
              </p>
            </div>
            <a 
              href="relatorio-wikipedia.html" 
              className="bg-[#141414] hover:bg-[#DCDAD7] hover:text-[#141414] text-[#E4E3E0] border border-[#141414] font-mono font-bold text-[10px] py-2.5 px-4 rounded-none text-center transition-colors uppercase tracking-wider block"
              target="_blank" 
              rel="noreferrer"
            >
              📄 Ler Relatório de Abusos →
            </a>
          </div>

        </div>
      </section>

      {/* 9. THE NEWSPAPER FOOTER */}
      <footer className="bg-[#141414] border-t-4 border-[#141414] text-stone-400 py-12 px-4 text-center">
        <div className="max-w-5xl mx-auto flex flex-col items-center">
          
          {/* Footer Logo */}
          <div className="flex items-center gap-2.5 mb-6">
            <img 
              src="https://wazzimagiygg.com/favicom.png" 
              alt="Footer Logo" 
              className="h-8 w-8 object-contain rounded-none bg-[#EBEAE8] p-0.5 border border-stone-700"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "https://gspotfverwazzimagiygg.wazzimagiygg.com/favicom.png";
              }}
            />
            <h2 className="font-serif font-bold text-lg text-white leading-none">
              Wazzima<span className="text-red-500">Giygg</span>
            </h2>
          </div>

          {/* Footer Links */}
          <div className="flex justify-center flex-wrap gap-x-6 gap-y-3 mb-8 text-[11px] font-mono font-bold tracking-wider uppercase text-stone-300">
            <a href="https://wazzimagiygg.com/donate/" className="hover:text-red-500 transition-colors">💝 Doação</a>
            <span className="text-stone-700 hidden sm:inline">•</span>
            <a href="https://wazzimagiygg.com/desktop.html" target="_blank" rel="noreferrer" className="hover:text-red-500 transition-colors">🖥️ Desktop</a>
            <span className="text-stone-700 hidden sm:inline">•</span>
            <a href="https://wazzimagiygg.com/LGPD" className="hover:text-red-500 transition-colors">🔒 LGPD</a>
            <span className="text-stone-700 hidden sm:inline">•</span>
            <a href="https://wazzimagiygg.com/MarcoCivil" className="hover:text-red-500 transition-colors">📜 Marco Civil</a>
            <span className="text-stone-700 hidden sm:inline">•</span>
            <a href="https://support.wazzimagiygg.com/" target="_blank" rel="noreferrer" className="hover:text-red-500 transition-colors">🎫 Ticket</a>
            <span className="text-stone-700 hidden sm:inline">•</span>
            <a href="https://wazzimagiygg.com/produtos" target="_blank" rel="noreferrer" className="text-amber-400 hover:text-amber-300 transition-colors">🛍️ Produtos</a>
            <span className="text-stone-700 hidden sm:inline">•</span>
            <a href="https://painel.wazzimagiygg.com/" target="_blank" rel="noreferrer" className="text-amber-400 hover:text-amber-300 transition-colors">🛍️ Conta</a>
          </div>

          <p className="text-[9px] font-mono text-stone-500 tracking-widest font-bold uppercase">
            © 2026 WazzimaGiygg - Todos os direitos reservados.
          </p>

        </div>
      </footer>

      {/* 10. LOGIN MODAL OVERLAY */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 bg-stone-950/70 backdrop-blur-sm z-[2100] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-none shadow-[10px_10px_0px_0px_rgba(20,20,20,1)] max-w-sm w-full overflow-hidden relative border-4 border-[#141414] animate-scale-up text-left">
            
            {/* Header border banner */}
            <div className="h-2 bg-[#141414]"></div>

            <button 
              onClick={() => setIsLoginModalOpen(false)}
              className="absolute top-4 right-4 text-stone-500 hover:text-stone-900 p-1 rounded-none hover:bg-stone-100 transition-colors cursor-pointer"
              aria-label="Fechar"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-8 text-center">
              <div className="w-12 h-12 bg-[#DCDAD7] border-2 border-[#141414] text-[#141414] rounded-none flex items-center justify-center mx-auto mb-5 shadow-sm">
                <User className="w-6 h-6" />
              </div>

              <h3 className="text-lg font-serif font-black text-stone-950 tracking-tight mb-2 uppercase">
                Identificação do Leitor
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed mb-6 font-serif">
                Para ter acesso completo ao acervo de notícias, salvar preferências e receber notificações, faça login ou acesse como convidado.
              </p>

              <div className="space-y-4">
                {/* Google Sign in */}
                <button 
                  onClick={handleGoogleLogin}
                  className="w-full bg-[#4285F4] hover:bg-[#357ae8] text-white text-xs font-mono font-bold py-3 px-5 rounded-none border border-[#141414] transition-all flex items-center justify-center gap-3 cursor-pointer shadow-[3px_3px_0px_0px_rgba(20,20,20,1)]"
                >
                  <img 
                    src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png" 
                    alt="Google icon" 
                    className="w-4 h-4 object-contain rounded-none bg-white p-0.5 shrink-0 border border-[#141414]"
                  />
                  <span>ENTRAR COM GOOGLE</span>
                </button>

                {/* Guest access */}
                <button 
                  onClick={handleGuestLogin}
                  className="w-full bg-[#141414] hover:bg-[#DCDAD7] hover:text-[#141414] text-[#E4E3E0] text-xs font-mono font-bold py-3 px-5 rounded-none border border-[#141414] transition-all flex items-center justify-center gap-3 cursor-pointer shadow-[3px_3px_0px_0px_rgba(20,20,20,1)]"
                >
                  <Monitor className="w-4 h-4 text-stone-400 shrink-0" />
                  <span>ACESSO CONVIDADO (24H)</span>
                </button>
              </div>

              <div className="mt-6 pt-4 border-t border-[#141414]/10">
                <button 
                  onClick={() => setIsLoginModalOpen(false)}
                  className="text-stone-500 hover:text-[#141414] text-xs font-mono font-bold transition-colors cursor-pointer uppercase tracking-wider"
                >
                  Cancelar
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// Safely display sectors
function displayDisplaysetor(sector: string) {
  if (!sector) return "Geral";
  return sector;
}
