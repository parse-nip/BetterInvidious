import { useState } from 'react';
import { api } from '../lib/api';

interface SubscribeButtonProps {
  ucid: string;
}

export function SubscribeButton({ ucid }: SubscribeButtonProps) {
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (loading) return;
    setLoading(true);
    try {
      if (subscribed) {
        await api.unsubscribeChannel(ucid);
        setSubscribed(false);
      } else {
        await api.subscribeChannel(ucid);
        setSubscribed(true);
      }
    } catch {
      /* Could redirect to login */
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="px-6 h-9 flex items-center justify-center rounded-[18px] bg-[var(--yt-accent)] text-white text-sm font-medium border-none cursor-pointer hover:bg-[var(--yt-accent-hover)] disabled:opacity-70"
    >
      {subscribed ? 'Subscribed' : 'Subscribe'}
    </button>
  );
}
