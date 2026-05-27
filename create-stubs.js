import fs from 'fs';
import path from 'path';

const files = {
  'src/components/HistoryView.tsx': `export default function HistoryView(props: any) { return <div />; }`,
  'src/components/AdminDashboard.tsx': `export default function AdminDashboard(props: any) { return <div />; }`,
  'src/components/layout/Header.tsx': `export function Header(props: any) { return <div />; }`,
  'src/components/layout/Footer.tsx': `export function Footer(props: any) { return <div />; }`,
  'src/components/layout/MobileNav.tsx': `export function MobileNav(props: any) { return <div />; }`,
  'src/components/modals/LimitModal.tsx': `export function LimitModal(props: any) { return <div />; }`,
  'src/components/modals/ProfileModal.tsx': `export function ProfileModal(props: any) { return <div />; }`,
  'src/components/modals/PricingModal.tsx': `export function PricingModal(props: any) { return <div />; }`,
  'src/components/modals/PaywallModal.tsx': `export function PaywallModal(props: any) { return <div />; }`,
  'src/components/modals/ShareModal.tsx': `export function ShareModal(props: any) { return <div />; }`,
  'src/components/MarkdownResult.tsx': `export function MarkdownResult(props: any) { return <div />; }`,
  'src/data/plants.ts': `export const plantsData = [];`,
  'src/firebase.ts': `export const auth = { currentUser: null } as any; export const db = {} as any; export const signInWithGoogle = async () => {}; export const logOut = async () => {};`,
  'src/utils/image.ts': `export const compressImage = async (data: any, type: any, w: any, h: any, q: any, out: any) => data; export const compressFile = async (f: any, w: any, h: any, q: any, out: any) => "";`,
  'src/lib/analytics.ts': `export const trackEvent = (event: string, data?: any) => {};`
};

for (const [filepath, content] of Object.entries(files)) {
  const fullpath = path.join(process.cwd(), filepath);
  fs.mkdirSync(path.dirname(fullpath), { recursive: true });
  if (!fs.existsSync(fullpath)) {
    fs.writeFileSync(fullpath, content);
  }
}
