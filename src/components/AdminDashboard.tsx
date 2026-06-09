import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, query, orderBy, writeBatch, limit, setDoc, getDoc, getCountFromServer } from 'firebase/firestore';
import { db } from '../firebase';
import { compressImage } from '../utils/image';
import { Trash2, Plus, Users, ScanLine, FileText, Leaf, ArrowUp, ArrowDown, Edit2, X, GripVertical, Search, Loader2, ShieldCheck } from 'lucide-react';
import { plantsData as defaultPlantsData } from '../data/plants';
import { Reorder } from 'framer-motion';

export default function AdminDashboard({ user, userProfile }: { user: any, userProfile: any }) {
  const [usersList, setUsersList] = useState<any[]>([]);
  const [plantsList, setPlantsList] = useState<any[]>([]);
  const [scansList, setScansList] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'users' | 'scans' | 'analytics' | 'system'>('analytics');
  const [stats, setStats] = useState({ users: 0, scans: 0, plants: 0 });
  const [metrics, setMetrics] = useState<any>({});
  const [systemStatus, setSystemStatus] = useState<any | null>(null);
  const [errorHeader, setErrorHeader] = useState<string | null>(null);

  const [isAddingPlant, setIsAddingPlant] = useState(false);
  const [editingPlantId, setEditingPlantId] = useState<string | null>(null);
  const [newPlant, setNewPlant] = useState({ name: '', slug: '', difficulty: '', image: '', bellImage: '', desc: '', bgColor: '#3A4F41', textColor: '#E8E4D9', tanzakuImage: '' });
  const [isUploadingPlantImage, setIsUploadingPlantImage] = useState(false);
  const [isUploadingBellImage, setIsUploadingBellImage] = useState(false);
  const [editPlantData, setEditPlantData] = useState({ name: '', slug: '', difficulty: '', image: '', bellImage: '', desc: '', bgColor: '#3A4F41', textColor: '#E8E4D9', tanzakuImage: '' });
  const [isUploadingEditPlantImage, setIsUploadingEditPlantImage] = useState(false);
  const [isUploadingEditBellImage, setIsUploadingEditBellImage] = useState(false);
  const [isUploadingTanzakuImage, setIsUploadingTanzakuImage] = useState(false);
  const [isUploadingEditTanzakuImage, setIsUploadingEditTanzakuImage] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [scanSearchQuery, setScanSearchQuery] = useState('');

  const isAdmin = userProfile?.role === 'admin';

  useEffect(() => {
    let isMounted = true;
    if (isAdmin) {
      if (activeTab === 'analytics') fetchAnalytics(isMounted);
      else if (activeTab === 'users') fetchUsers(isMounted);
      else if (activeTab === 'scans') fetchScans(isMounted);
      else if (activeTab === 'system') fetchSystemStatus(isMounted);
    }
    return () => {
      isMounted = false;
    };
  }, [isAdmin, activeTab]);

  const fetchAnalytics = async (isMounted = true, showLoading = true) => {
    if (showLoading && isMounted) setIsLoading(true);
    try {
      const metricsRef = doc(db, 'metrics', 'global');
      const metricsSnap = await getDoc(metricsRef);
      if (metricsSnap.exists() && isMounted) {
        setMetrics(metricsSnap.data());
      }

      const today = new Date().toISOString().split('T')[0];
      const dailyRef = doc(db, 'metrics', today);
      const dailySnap = await getDoc(dailyRef);
      if (dailySnap.exists() && isMounted) {
        setMetrics((prev: any) => ({ ...prev, today: dailySnap.data() }));
      }

      try {
        const usersCountSnap = await getCountFromServer(collection(db, 'users'));
        const scansCountSnap = await getCountFromServer(collection(db, 'scans'));
        if (isMounted) {
          setStats(prev => ({
            ...prev,
            users: usersCountSnap.data().count,
            scans: scansCountSnap.data().count
          }));
        }
      } catch (countError) {
        console.warn("Could not fetch global counts for analytics", countError);
      }

    } catch (error: any) {
      if (error.message?.includes("Missing or insufficient permissions")) {
        console.warn('Analytics access denied. Firebase rules for metrics not fully deployed yet.');
      } else {
        console.error("Error fetching analytics", error);
        if (isMounted) setErrorHeader(error.message);
      }
    } finally {
      if (isMounted) setIsLoading(false);
    }
  };

  const fetchSystemStatus = async (isMounted = true, showLoading = true) => {
    if (showLoading && isMounted) setIsLoading(true);
    try {
      const response = await fetch('/api/system-status');
      const data = await response.json().catch(() => ({}));
      if (isMounted) setSystemStatus(data);
    } catch (error: any) {
      console.error("Error fetching system status", error);
      if (isMounted) setErrorHeader(error.message);
    } finally {
      if (isMounted) setIsLoading(false);
    }
  };

  const fetchUsers = async (isMounted = true, showLoading = true) => {
    if (showLoading && isMounted) setIsLoading(true);
    try {
      const usersQuery = query(collection(db, 'users'), limit(50));
      const usersSnap = await getDocs(usersQuery);
      const usersData = usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      usersData.sort((a: any, b: any) => {
        const timeA = a.createdAt?.seconds || 0;
        const timeB = b.createdAt?.seconds || 0;
        return timeB - timeA;
      });

      let totalUsersCount = usersData.length;
      try {
        const countSnap = await getCountFromServer(collection(db, 'users'));
        totalUsersCount = countSnap.data().count;
      } catch (countErr) {
        console.warn("Could not get total users count", countErr);
      }

      if (isMounted) {
        setUsersList(usersData);
        setStats(prev => ({ ...prev, users: totalUsersCount }));
      }
    } catch (error: any) {
      if (error.message?.includes("Missing or insufficient permissions")) {
        console.warn('Users access denied. Firebase rules not fully deployed.');
      } else {
        console.error("Error fetching users", error);
        if (isMounted) setErrorHeader(error.message);
      }
    } finally {
      if (isMounted) setIsLoading(false);
    }
  };

  const fetchScans = async (isMounted = true, showLoading = true) => {
    if (showLoading && isMounted) setIsLoading(true);
    try {
      const scansQuery = query(collection(db, 'scans'), orderBy('createdAt', 'desc'), limit(50));
      const scansSnap = await getDocs(scansQuery);
      const scansData = scansSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      let totalScansCount = scansData.length;
      try {
        const countSnap = await getCountFromServer(collection(db, 'scans'));
        totalScansCount = countSnap.data().count;
      } catch (countErr) {
        console.warn("Could not get total scans count", countErr);
      }

      if (isMounted) {
        setScansList(scansData);
        setStats(prev => ({ ...prev, scans: totalScansCount }));
      }
    } catch (error: any) {
      if (error.message?.includes("Missing or insufficient permissions")) {
        console.warn('Scans access denied. Firebase rules not fully deployed.');
      } else {
        console.error("Error fetching scans", error);
        if (isMounted) setErrorHeader(error.message);
      }
    } finally {
      if (isMounted) setIsLoading(false);
    }
  };



  const generateSlug = (text: string) => {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  };

  const handleUpdateLocalPoints = (userId: string, newPointsStr: string) => {
    // Allow empty string for clearing out the input temporarily
    const val = newPointsStr === '' ? '' : parseInt(newPointsStr, 10);
    setUsersList(prev => prev.map(u => u.id === userId ? { ...u, scanPoints: val } : u));
  };

  const handleUpdateUserPointsDB = async (userId: string, newPointsStr: string | number) => {
    let newPoints = typeof newPointsStr === 'string' ? parseInt(newPointsStr, 10) : newPointsStr;
    if (isNaN(newPoints) || newPoints < 0) newPoints = 0;

    try {
      await updateDoc(doc(db, 'users', userId), {
        scanPoints: newPoints
      });
      // Ensure the UI reflects the corrected value (e.g. if it was empty, now it's 0)
      setUsersList(prev => prev.map(u => u.id === userId ? { ...u, scanPoints: newPoints } : u));
    } catch (error) {
      console.error("Error updating user points", error);
    }
  };

  const handlePlantImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingPlantImage(true);
    try {
      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64String = reader.result as string;
          resolve(base64String.split(',')[1]);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const compressedData = await compressImage(base64Data, file.type, 800, 800, 0.85, 'image/webp');
      const dataUrl = `data:image/webp;base64,${compressedData}`;
      setNewPlant(prev => ({ ...prev, image: dataUrl }));
    } catch (error) {
      console.error("Failed to process plant image", error);
      alert("Failed to process image. Please try another one.");
    } finally {
      setIsUploadingPlantImage(false);
    }
  };

  const handlePlantBellImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingBellImage(true);
    try {
      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64String = reader.result as string;
          resolve(base64String.split(',')[1]);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const compressedData = await compressImage(base64Data, file.type, 800, 800, 0.85, 'image/webp');
      const dataUrl = `data:image/webp;base64,${compressedData}`;
      setNewPlant(prev => ({ ...prev, bellImage: dataUrl }));
    } catch (error) {
      console.error("Failed to process bell image", error);
      alert("Failed to process image. Please try another one.");
    } finally {
      setIsUploadingBellImage(false);
    }
  };

  const handlePlantTanzakuImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingTanzakuImage(true);
    try {
      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64String = reader.result as string;
          resolve(base64String.split(',')[1]);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const compressedData = await compressImage(base64Data, file.type, 400, 800, 0.85, 'image/webp');
      const dataUrl = `data:image/webp;base64,${compressedData}`;
      setNewPlant(prev => ({ ...prev, tanzakuImage: dataUrl }));
    } catch (error) {
      console.error("Failed to process tanzaku image", error);
      alert("Failed to process image. Please try another one.");
    } finally {
      setIsUploadingTanzakuImage(false);
    }
  };

  const handleAddPlant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlant.name || !newPlant.desc || !newPlant.difficulty || !newPlant.image) return;

    const slug = newPlant.slug || generateSlug(newPlant.name);

    try {
      const docRef = await addDoc(collection(db, 'plants'), {
        ...newPlant,
        slug,
        order: plantsList.length,
        createdAt: serverTimestamp()
      });
      setIsAddingPlant(false);
      const newPlantObj = { id: docRef.id, ...newPlant, slug, order: plantsList.length, createdAt: { seconds: Date.now() / 1000 } };
      setNewPlant({ name: '', slug: '', difficulty: '', image: '', bellImage: '', desc: '', bgColor: '#3A4F41', textColor: '#E8E4D9', tanzakuImage: '' });
      setPlantsList(prev => [...prev, newPlantObj]);
    } catch (error) {
      console.error("Error adding plant", error);
    }
  };

  const handleEditPlantImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingEditPlantImage(true);
    try {
      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64String = reader.result as string;
          resolve(base64String.split(',')[1]);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const compressedData = await compressImage(base64Data, file.type, 800, 800, 0.85, 'image/webp');
      const dataUrl = `data:image/webp;base64,${compressedData}`;
      setEditPlantData(prev => ({ ...prev, image: dataUrl }));
    } catch (error) {
      console.error("Failed to process plant image", error);
      alert("Failed to process image. Please try another one.");
    } finally {
      setIsUploadingEditPlantImage(false);
    }
  };

  const handleEditPlantBellImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingEditBellImage(true);
    try {
      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64String = reader.result as string;
          resolve(base64String.split(',')[1]);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const compressedData = await compressImage(base64Data, file.type, 800, 800, 0.85, 'image/webp');
      const dataUrl = `data:image/webp;base64,${compressedData}`;
      setEditPlantData(prev => ({ ...prev, bellImage: dataUrl }));
    } catch (error) {
      console.error("Failed to process bell image", error);
      alert("Failed to process image. Please try another one.");
    } finally {
      setIsUploadingEditBellImage(false);
    }
  };

  const handleEditPlantTanzakuImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingEditTanzakuImage(true);
    try {
      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64String = reader.result as string;
          resolve(base64String.split(',')[1]);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const compressedData = await compressImage(base64Data, file.type, 400, 800, 0.85, 'image/webp');
      const dataUrl = `data:image/webp;base64,${compressedData}`;
      setEditPlantData(prev => ({ ...prev, tanzakuImage: dataUrl }));
    } catch (error) {
      console.error("Failed to process tanzaku image", error);
      alert("Failed to process image. Please try another one.");
    } finally {
      setIsUploadingEditTanzakuImage(false);
    }
  };

  const handleUpdatePlant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlantId || !editPlantData.name || !editPlantData.difficulty || !editPlantData.image) {
      alert("Name, Difficulty, and Plant Photo are required.");
      return;
    }

    try {
      const slug = editPlantData.slug || generateSlug(editPlantData.name);
      await updateDoc(doc(db, 'plants', editingPlantId), {
        name: editPlantData.name,
        slug,
        difficulty: editPlantData.difficulty,
        image: editPlantData.image,
        bellImage: editPlantData.bellImage || '',
        desc: editPlantData.desc || '',
        bgColor: editPlantData.bgColor || '#3A4F41',
        textColor: editPlantData.textColor || '#E8E4D9',
        tanzakuImage: editPlantData.tanzakuImage || ''
      });
      setPlantsList(prev => prev.map(p => p.id === editingPlantId ? { ...p, ...editPlantData, slug } : p));
      setEditingPlantId(null);
    } catch (error) {
      console.error("Error updating plant", error);
      alert("Failed to update plant. See console for details.");
    }
  };

  const startEditingPlant = (plant: any) => {
    setEditPlantData({
      name: plant.name,
      slug: plant.slug || '',
      difficulty: plant.difficulty,
      image: plant.image,
      bellImage: plant.bellImage || '',
      desc: plant.desc,
      bgColor: plant.bgColor || '#3A4F41',
      textColor: plant.textColor || '#E8E4D9',
      tanzakuImage: plant.tanzakuImage || ''
    });
    setEditingPlantId(plant.id);
    setIsAddingPlant(false);
  };

  const handleReorder = async (newOrder: any[]) => {
    setPlantsList(newOrder);

    try {
      const batch = writeBatch(db);
      newOrder.forEach((plant, index) => {
        batch.update(doc(db, 'plants', plant.id), { order: index });
      });
      await batch.commit();
    } catch (error) {
      console.error("Error saving new order", error);
      // Removed fetchData() as it's decoupled now
    }
  };

  const handleDeletePlant = async (id: string) => {
    try {
      if (window.confirm('Are you sure you want to delete this plant?')) {
        await deleteDoc(doc(db, 'plants', id));
        setPlantsList(prev => prev.filter(p => p.id !== id));
      }
    } catch (error: any) {
      console.error("Error deleting plant", error);
      alert(error.message);
    }
  };

  const seedDefaultPlants = async () => {
    setIsLoading(true);
    try {
      const batch = writeBatch(db);
      const newPlants = [];
      for (let i = 0; i < defaultPlantsData.length; i++) {
        const plant = defaultPlantsData[i];
        const newPlantRef = doc(collection(db, 'plants'));
        const plantData = {
          name: plant.name,
          difficulty: plant.difficulty,
          image: plant.image,
          desc: plant.desc,
          bgColor: plant.bgColor,
          textColor: plant.textColor,
          order: i,
          createdAt: serverTimestamp()
        };
        batch.set(newPlantRef, plantData);
        newPlants.push({ id: newPlantRef.id, ...plantData, createdAt: { seconds: Date.now() / 1000 } });
      }
      await batch.commit();
      setPlantsList(prev => [...prev, ...newPlants]);
    } catch (error) {
      console.error("Error seeding plants", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center text-forest-deep">
        <p>Access Denied. You are not an admin.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="w-full max-w-6xl mx-auto px-6 py-24 animate-pulse">
        <div className="h-12 bg-stone-200 rounded-lg w-64 mb-12"></div>
        <div className="flex gap-4 mb-8 border-b border-stone-200 pb-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-10 bg-stone-200 rounded-full w-24"></div>
          ))}
        </div>
        <div className="space-y-6">
          <div className="flex justify-between items-center mb-6">
            <div className="h-8 bg-stone-200 rounded w-48"></div>
            <div className="h-10 bg-stone-200 rounded-full w-32"></div>
          </div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-24 bg-stone-100 rounded-2xl w-full"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-6 py-24">
      <h1 className="text-4xl font-light text-forest-deep mb-12 font-heading">Admin Dashboard</h1>

      {errorHeader && (
        <div className="bg-red-50 text-red-800 p-4 rounded-xl mb-8 border border-red-200">
          <h3 className="font-bold mb-1">Database Error</h3>
          <p className="text-sm">{errorHeader}</p>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-forest-deep/5 flex items-center gap-6">
          <div className="w-16 h-16 rounded-full bg-forest-deep/5 flex items-center justify-center text-forest-deep">
            <Users className="w-8 h-8" />
          </div>
          <div>
            <div className="text-sm font-bold uppercase tracking-wider text-stone-muted mb-1">Total Users</div>
            <div className="text-4xl font-light text-forest-deep">{stats.users}</div>
          </div>
        </div>
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-forest-deep/5 flex items-center gap-6">
          <div className="w-16 h-16 rounded-full bg-forest-deep/5 flex items-center justify-center text-forest-deep">
            <ScanLine className="w-8 h-8" />
          </div>
          <div>
            <div className="text-sm font-bold uppercase tracking-wider text-stone-muted mb-1">Total Scans</div>
            <div className="text-4xl font-light text-forest-deep">{stats.scans}</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-8 mb-8 border-b border-stone-200">
        <button
          onClick={() => setActiveTab('analytics')}
          className={`pb-4 text-sm font-bold uppercase tracking-wider transition-colors ${activeTab === 'analytics' ? 'border-b-2 border-forest-deep text-forest-deep' : 'text-stone-muted hover:text-forest-deep/70'}`}
        >
          Analytics
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-4 text-sm font-bold uppercase tracking-wider transition-colors ${activeTab === 'users' ? 'border-b-2 border-forest-deep text-forest-deep' : 'text-stone-muted hover:text-forest-deep/70'}`}
        >
          Users
        </button>
        <button
          onClick={() => setActiveTab('scans')}
          className={`pb-4 text-sm font-bold uppercase tracking-wider transition-colors ${activeTab === 'scans' ? 'border-b-2 border-forest-deep text-forest-deep' : 'text-stone-muted hover:text-forest-deep/70'}`}
        >
          User Scans
        </button>
        <button
          onClick={() => setActiveTab('system')}
          className={`pb-4 text-sm font-bold uppercase tracking-wider transition-colors ${activeTab === 'system' ? 'border-b-2 border-forest-deep text-forest-deep' : 'text-stone-muted hover:text-forest-deep/70'}`}
        >
          System
        </button>
      </div>

      {activeTab === 'system' && (
        <div className="bg-white rounded-[2rem] shadow-sm border border-forest-deep/5 p-8 md:p-12 mb-8">
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-light text-forest-deep mb-2">Deployment Health</h2>
              <p className="text-sm text-stone-muted max-w-xl">
                Checks whether required production settings exist. Secret values are never shown.
              </p>
            </div>
            <button
              onClick={() => fetchSystemStatus(true)}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-forest-deep/10 px-5 py-3 text-xs font-bold uppercase tracking-widest text-forest-deep transition-colors hover:bg-stone-50"
            >
              <ShieldCheck className="h-4 w-4" />
              Refresh
            </button>
          </div>

          {isLoading && !systemStatus ? (
            <div className="flex items-center gap-3 text-sm text-stone-muted">
              <Loader2 className="h-4 w-4 animate-spin" />
              Checking deployment settings...
            </div>
          ) : (
            <>
              <div className={`mb-6 inline-flex rounded-full px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] ${
                systemStatus?.status === 'ok'
                  ? 'bg-emerald-50 text-emerald-900'
                  : systemStatus?.status === 'warning'
                    ? 'bg-yellow-50 text-yellow-800'
                    : 'bg-red-50 text-red-800'
              }`}>
                {systemStatus?.status || 'unknown'}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(systemStatus?.checks || []).map((check: any) => (
                  <div
                    key={check.label}
                    className={`rounded-2xl border p-5 ${
                      check.status === 'ok'
                        ? 'border-emerald-900/10 bg-emerald-50/40'
                        : check.status === 'warning'
                          ? 'border-yellow-800/15 bg-yellow-50/50'
                          : 'border-red-900/15 bg-red-50/45'
                    }`}
                  >
                    <div className="mb-2 flex items-center justify-between gap-4">
                      <h3 className="text-sm font-bold text-forest-deep">{check.label}</h3>
                      <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-forest-deep/55">
                        {check.configured ? 'configured' : 'missing'}
                      </span>
                    </div>
                    {check.hint && (
                      <p className="text-xs leading-relaxed text-forest-deep/60">{check.hint}</p>
                    )}
                  </div>
                ))}
              </div>

              <p className="mt-6 text-[11px] uppercase tracking-[0.16em] text-stone-muted">
                Last checked: {systemStatus?.generatedAt ? new Date(systemStatus.generatedAt).toLocaleString() : 'never'}
              </p>
            </>
          )}
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="bg-white rounded-[2rem] shadow-sm border border-forest-deep/5 p-8 md:p-12 mb-8">
          <h2 className="text-2xl font-light text-forest-deep mb-8">System Analytics Overview</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            <div className="p-6 bg-stone-50 rounded-2xl border border-stone-100">
              <div className="text-xs uppercase tracking-wider text-stone-muted mb-2 font-bold">Total Scans All-time</div>
              <div className="text-3xl text-forest-deep">{metrics?.totalScans || 0}</div>
            </div>
            <div className="p-6 bg-stone-50 rounded-2xl border border-stone-100">
              <div className="text-xs uppercase tracking-wider text-stone-muted mb-2 font-bold">Today's Scans</div>
              <div className="text-3xl text-forest-deep">{metrics?.today?.totalScans || 0}</div>
            </div>
             <div className="p-6 bg-stone-50 rounded-2xl border border-stone-100">
              <div className="text-xs uppercase tracking-wider text-stone-muted mb-2 font-bold">Successful Scans</div>
              <div className="text-3xl text-forest-deep">{metrics?.successfulScans || 0}</div>
            </div>
            <div className="p-6 bg-stone-50 rounded-2xl border border-stone-100">
              <div className="text-xs uppercase tracking-wider text-stone-muted mb-2 font-bold">Free Scans Used</div>
              <div className="text-3xl text-forest-deep">{metrics?.freeScans || 0}</div>
            </div>
            <div className="p-6 bg-stone-50 rounded-2xl border border-stone-100">
              <div className="text-xs uppercase tracking-wider text-stone-muted mb-2 font-bold">Gemini Calls (Attempted)</div>
              <div className="text-3xl text-forest-deep">{metrics?.geminiCalls || 0}</div>
            </div>
            <div className="p-6 bg-stone-50 rounded-2xl border border-stone-100">
              <div className="text-xs uppercase tracking-wider text-stone-muted mb-2 font-bold">Diagnosis Success Rate</div>
              <div className="text-3xl text-forest-deep">
                {metrics?.totalScans ? Math.round(((metrics.successfulScans || 0) / metrics.totalScans) * 100) : 0}%
              </div>
            </div>
            <div className="p-6 bg-stone-50 rounded-2xl border border-stone-100">
              <div className="text-xs uppercase tracking-wider text-stone-muted mb-2 font-bold">Save to Garden</div>
              <div className="text-3xl text-forest-deep">{metrics?.saveToGarden || 0}</div>
            </div>
            <div className="p-6 bg-stone-50 rounded-2xl border border-stone-100">
              <div className="text-xs uppercase tracking-wider text-stone-muted mb-2 font-bold">Share Clicks</div>
              <div className="text-3xl text-forest-deep">{metrics?.shareClicks || 0}</div>
            </div>
            <div className="p-6 bg-stone-50 rounded-2xl border border-stone-100">
              <div className="text-xs uppercase tracking-wider text-stone-muted mb-2 font-bold">Unlock PRO Clicks</div>
              <div className="text-3xl text-forest-deep">{metrics?.unlockClicks || 0}</div>
            </div>
            <div className="p-6 bg-stone-50 rounded-2xl border border-stone-100">
              <div className="text-xs uppercase tracking-wider text-stone-muted mb-2 font-bold">Unlock PRO Conversion</div>
              <div className="text-3xl text-forest-deep">
                 {metrics?.totalScans ? Math.round(((metrics.unlockClicks || 0) / metrics.totalScans) * 100) : 0}%
              </div>
            </div>
            <div className="p-6 bg-stone-50 rounded-2xl border border-stone-100">
              <div className="text-xs uppercase tracking-wider text-stone-muted mb-2 font-bold">Pricing Clicks</div>
              <div className="text-3xl text-forest-deep">{metrics?.pricingPackageClicks || 0}</div>
            </div>
            <div className="p-6 bg-stone-50 rounded-2xl border border-stone-100">
              <div className="text-xs uppercase tracking-wider text-stone-muted mb-2 font-bold">Email Submissions</div>
              <div className="text-3xl text-forest-deep">{metrics?.emailSubmissions || 0}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
            <div>
               <h3 className="text-lg font-light text-forest-deep mb-4 border-b border-stone-100 pb-2">Top Plants Scanned</h3>
               <ul className="space-y-2">
                 {Object.entries(metrics?.topPlants || {}).sort((a: any, b: any) => b[1] - a[1]).slice(0, 10).map(([plant, count]: any) => (
                   <li key={plant} className="flex justify-between items-center bg-stone-50 px-4 py-2 rounded-lg">
                     <span className="capitalize">{plant.replace(/_/g, ' ')}</span>
                     <span className="font-bold text-forest-deep">{count}</span>
                   </li>
                 ))}
                 {(!metrics?.topPlants || Object.keys(metrics.topPlants).length === 0) && (
                   <div className="text-stone-muted text-sm italic">No data yet</div>
                 )}
               </ul>
            </div>
            <div>
               <h3 className="text-lg font-light text-forest-deep mb-4 border-b border-stone-100 pb-2">Top Problems Found</h3>
               <ul className="space-y-2">
                 {Object.entries(metrics?.topProblems || {}).sort((a: any, b: any) => b[1] - a[1]).slice(0, 10).map(([problem, count]: any) => (
                   <li key={problem} className="flex justify-between items-center bg-stone-50 px-4 py-2 rounded-lg">
                     <span className="capitalize">{problem.replace(/_/g, ' ')}</span>
                     <span className="font-bold text-forest-deep">{count}</span>
                   </li>
                 ))}
                 {(!metrics?.topProblems || Object.keys(metrics.topProblems).length === 0) && (
                   <div className="text-stone-muted text-sm italic">No data yet</div>
                 )}
               </ul>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="bg-white rounded-[2rem] shadow-sm border border-forest-deep/5 p-8 md:p-12">
          <h2 className="text-2xl font-light text-forest-deep mb-8">Registered Users</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-stone-200 text-xs uppercase tracking-wider text-stone-muted">
                  <th className="pb-4 font-medium px-4">User</th>
                  <th className="pb-4 font-medium px-4">Joined</th>
                  <th className="pb-4 font-medium px-4">Scans</th>
                  <th className="pb-4 font-medium px-4">Saved</th>
                  <th className="pb-4 font-medium px-4">Points</th>
                  <th className="pb-4 font-medium px-4">Role</th>
                </tr>
              </thead>
              <tbody>
                {usersList.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-stone-muted">
                      No registered users found.
                    </td>
                  </tr>
                ) : (
                  usersList.map(u => (
                    <tr key={u.id} className="border-b border-stone-100 last:border-0 hover:bg-stone-50 transition-colors">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={u.photoUrl || `https://api.dicebear.com/7.x/notionists/svg?seed=${u.id}&backgroundColor=e5e5e5`}
                            alt="Avatar"
                            className="w-8 h-8 rounded-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                          <div>
                            <div className="font-medium text-forest-deep">{u.name || 'Anonymous'}</div>
                            <div className="text-xs text-stone-muted">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-sm text-stone-muted">
                        {u.createdAt ? new Date(u.createdAt.seconds ? u.createdAt.seconds * 1000 : u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Unknown'}
                      </td>
                      <td className="py-4 px-4 text-sm text-forest-deep font-medium">{u.plantsScanned || 0}</td>
                      <td className="py-4 px-4 text-sm text-forest-deep font-medium">{u.plantsSaved || 0}</td>
                      <td className="py-4 px-4 text-sm text-forest-deep font-medium">
                        <input
                          type="number"
                          className="w-16 px-2 py-1 bg-stone-100 rounded-lg text-forest-deep text-center focus:outline-none focus:ring-1 focus:ring-forest-deep/20 border-none select-all"
                          value={u.scanPoints === '' ? '' : (u.scanPoints || 0)}
                          onChange={(e) => handleUpdateLocalPoints(u.id, e.target.value)}
                          onBlur={(e) => handleUpdateUserPointsDB(u.id, e.target.value)}
                        />
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-3 py-1.5 rounded-full text-[10px] uppercase tracking-wider font-bold ${u.role === 'admin' ? 'bg-forest-deep/10 text-forest-deep' : 'bg-stone-100 text-stone-500'}`}>
                          {u.role || 'user'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'scans' && (() => {
        const filteredScans = scansList.filter(scan => {
          if (!scanSearchQuery) return true;
          const query = scanSearchQuery.toLowerCase();
          const scanUser = usersList.find(u => u.id === scan.userId);
          const speciesMatch = (scan.basic?.species || scan.species || "Unknown")?.toLowerCase().includes(query);
          const emailMatch = scanUser?.email?.toLowerCase().includes(query);
          return speciesMatch || emailMatch;
        });

        return (
          <div className="bg-white rounded-[2rem] shadow-sm border border-forest-deep/5 p-8 md:p-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
              <h2 className="text-2xl font-light text-forest-deep">User Scan History</h2>
              <div className="relative w-full md:w-96">
                <input
                  type="text"
                  placeholder="Search by plant or email..."
                  value={scanSearchQuery}
                  onChange={(e) => setScanSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 pl-11 rounded-xl border border-stone-200 focus:outline-none focus:border-forest-deep/50 bg-stone-50 text-sm"
                />
                <Search className="w-5 h-5 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2" />
              </div>
            </div>
            <div className="space-y-4">
              {filteredScans.map(scan => {
                const scanUser = usersList.find(u => u.id === scan.userId);
                return (
                  <div key={scan.id} className="flex flex-col md:flex-row gap-6 p-6 bg-stone-50 rounded-2xl border border-stone-100">
                    {(scan.imageUrl || scan.imageData) && (
                      <div className="w-full md:w-32 h-32 rounded-xl overflow-hidden shrink-0 bg-stone-200">
                        <img src={scan.imageUrl || `data:${scan.imageType || 'image/jpeg'};base64,${scan.imageData}`} alt={(scan.basic?.species || scan.species || "Unknown")} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="text-lg font-medium text-forest-deep">{(scan.basic?.species || scan.species || "Unknown")}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full ${
                              (scan.basic?.risk || scan.risk || "N/A") === 'High' ? 'bg-red-100 text-red-700' :
                              (scan.basic?.risk || scan.risk || "N/A") === 'Moderate' ? 'bg-yellow-100 text-yellow-700' :
                              ((scan.basic?.risk || scan.risk || "N/A") === 'Healthy' || (scan.basic?.risk || scan.risk || "N/A") === 'Low' || (scan.basic?.risk || scan.risk || "N/A") === 'None') ? 'bg-green-100 text-green-700' :
                              'bg-stone-200 text-stone-600'
                            }`}>
                              Risk: {(scan.basic?.risk || scan.risk || "N/A")}
                            </span>
                            <span className="text-xs text-stone-muted">
                              {scan.createdAt ? new Date(scan.createdAt.seconds ? scan.createdAt.seconds * 1000 : scan.createdAt).toLocaleString() : 'Unknown date'}
                            </span>
                          </div>
                        </div>
                        {scanUser && (
                          <div className="flex items-center gap-2 text-right">
                            <div className="hidden md:block">
                              <div className="text-sm font-medium text-forest-deep">{scanUser.name || 'Anonymous'}</div>
                              <div className="text-xs text-stone-muted">{scanUser.email}</div>
                            </div>
                            <img
                              src={scanUser.photoUrl || `https://api.dicebear.com/7.x/notionists/svg?seed=${scanUser.id}&backgroundColor=e5e5e5`}
                              alt="Avatar"
                              className="w-8 h-8 rounded-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-stone-600 mt-3 line-clamp-3">{(scan.basic?.mainIssue || scan.summary || "No summary")}</p>
                    </div>
                  </div>
                );
              })}
              {scansList.length === 0 && (
                <p className="text-center text-stone-muted py-8">No scans recorded yet.</p>
              )}
              {scansList.length > 0 && filteredScans.length === 0 && (
                <p className="text-center text-stone-muted py-8">No scans found matching "{scanSearchQuery}".</p>
              )}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
