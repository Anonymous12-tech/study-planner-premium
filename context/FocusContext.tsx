import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../utils/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

type FocusContextType = {
    activeStudentsCount: number;
    setIsFocusing: (isFocusing: boolean) => void;
};

const FocusContext = createContext<FocusContextType>({
    activeStudentsCount: 0,
    setIsFocusing: () => { },
});

export const useFocus = () => useContext(FocusContext);

export const FocusProvider = ({ children }: { children: React.ReactNode }) => {
    const [activeStudentsCount, setActiveStudentsCount] = useState(0);
    const [isFocusing, setIsFocusing] = useState(false);
    const [channel, setChannel] = useState<RealtimeChannel | null>(null);

    useEffect(() => {
        // randomized ID for anonymous presence if user is not logged in (though we usually require auth)
        // For simplicity, we just rely on the socket connection ID handled by Supabase

        const roomChannel = supabase.channel('global_focus_room', {
            config: {
                presence: {
                    key: 'user_' + Math.random().toString(36).substr(2, 9),
                },
            },
        });

        roomChannel
            .on('presence', { event: 'sync' }, () => {
                const state = roomChannel.presenceState();

                // Count how many users have isFocusing: true
                let count = 0;
                Object.values(state).forEach((presences: any) => {
                    presences.forEach((presence: any) => {
                        if (presence.isFocusing) {
                            count++;
                        }
                    });
                });

                // Add jitter/randomness for demo if count is low (optional, skipping for realism)
                // But let's at least show "42" as requested if real count is low for the "vibe"
                // Actually, let's keep it real. If 0, maybe show a baseline.
                // For now, true count.
                setActiveStudentsCount(count);
            })
            .subscribe(async (status) => {
                if (status === 'SUBSCRIBED') {
                    // Initial track
                    await roomChannel.track({
                        isFocusing: false,
                        onlineAt: new Date().toISOString(),
                    });
                }
            });

        setChannel(roomChannel);

        return () => {
            supabase.removeChannel(roomChannel);
        };
    }, []);

    // Track state changes
    useEffect(() => {
        if (channel) {
            channel.track({
                isFocusing,
                onlineAt: new Date().toISOString(),
            });
        }
    }, [isFocusing, channel]);

    return (
        <FocusContext.Provider value={{ activeStudentsCount, setIsFocusing }}>
            {children}
        </FocusContext.Provider>
    );
};
