'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { ExternalLink, MapPin, Mail, Phone, Globe } from 'lucide-react';
import api from '@/lib/axios';
import Loader from '@/components/ui/Loader';
import AcademyProfileView from '@/components/academy/AcademyProfileView';

export default function AcademyProfilePage({ params }) {
    const unwrappedParams = use(params);
    const { id } = unwrappedParams;
    const [academy, setAcademy] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAcademy = async () => {
            try {
                const res = await api.get(`/academies/${id}`);
                if (res.data.success) {
                    setAcademy(res.data.data);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchAcademy();
    }, [id]);

    if (loading) return <Loader fullScreen text="Loading Profile..." />;
    if (!academy) return <div>Academy not found</div>;

    return (
        <div className="space-y-6">
            <AcademyProfileView academy={academy} />
        </div>
    );
}
