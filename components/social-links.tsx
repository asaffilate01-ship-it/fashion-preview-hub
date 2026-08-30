import { socialProfiles } from "@/lib/social";

function SocialIcon({ name }: { name: string }) {
  if (name === "Facebook") return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14.2 8H17V4.2c-.5-.1-2.1-.2-4-.2-3.9 0-6.6 2.4-6.6 6.8V14H2v4.3h4.4V24h5.4v-5.7h4.1l.7-4.3h-4.8v-2.8C11.8 10 12.2 8 14.2 8Z" /></svg>;
  if (name === "Instagram") return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7Zm5 3a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm5.5-3.3a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4Z" /></svg>;
  if (name === "TikTok") return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14.4 2h3.4c.2 1.7 1.2 3.2 2.8 4v3.5a8.2 8.2 0 0 1-2.8-.7v7.1A6.1 6.1 0 1 1 12 9.8v3.5a2.8 2.8 0 1 0 2.4 2.8V2Z" /></svg>;
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18.7 2H22l-7.2 8.2L23.3 22h-6.7l-5.2-6.9L5.3 22H2l7.8-8.9L1.6 2h6.8l4.7 6.2L18.7 2Zm-1.2 17.9h1.8L7.4 4H5.5l12 15.9Z" /></svg>;
}

export default function SocialLinks() {
  return <div className="social-links" aria-label="KALËTHON social profiles">{socialProfiles.map((profile) => profile.href ? <a href={profile.href} key={profile.key} target="_blank" rel="noreferrer" aria-label={`KALËTHON on ${profile.name}`}><SocialIcon name={profile.name} /></a> : <span key={profile.key} aria-label={`${profile.name} profile coming soon`} title={`${profile.name} handle to be connected`}><SocialIcon name={profile.name} /></span>)}</div>;
}
