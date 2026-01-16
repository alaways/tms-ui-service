import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { setPageTitle } from '../../../store/themeConfigSlice';
import 'tippy.js/dist/tippy.css';
import { url_api } from '../../../services/endpoints';

import IconInfoCircle from '../../../components/Icon/IconInfoCircle';
import { useGlobalMutation } from '../../../helpers/globalApi';
import themeConfig from '../../../theme.config';

const mode = process.env.MODE || 'admin';

const List = () => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const storedUser = localStorage.getItem(mode);
    const role = storedUser ? JSON.parse(storedUser).role : null;
    const id_shop = storedUser ? JSON.parse(storedUser).id_shop : null;

    useEffect(() => {
        dispatch(setPageTitle(t('notification_title')));
    }, [dispatch]);

    const [notifications, setNotifications] = useState([]);
    const [newNotificationsCount, setNewNotificationsCount] = useState(0);
    const [readNotifications, setReadNotifications] = useState<string[]>(() => {
        const storedReadNotifications = localStorage.getItem('readNotifications');
        return storedReadNotifications ? JSON.parse(storedReadNotifications) : [];
    });

    // State to keep track of the number of notifications to load
    const [limit, setLimit] = useState(10);
    const [loading, setLoading] = useState(false); // Loading state
    const [hasMore, setHasMore] = useState(true); // Track if there are more notifications to load

    const { mutate: markNotificationAsRead } = useGlobalMutation(url_api.readNotify, {
        onSuccess: (res: any) => {
            setReadNotifications((prevReadNotifications) => [...prevReadNotifications, res.data.notificationId]);
            setNewNotificationsCount((prevCount) => prevCount - 1);
        },
        onError: (err: any) => {
            console.error("Failed to mark notification as read:", err);
        },
    });

    const markAsRead = (notification: any) => {
        if (notification?.id && !readNotifications.includes(notification.id)) {
            markNotificationAsRead({ id: notification.id });
        }
    };

    const { mutate: getNotify } = useGlobalMutation(url_api.getNotify+'?all=1', {
        onSuccess: (res: any) => {
            const sortedNotifications = res.data.sort(
                (a: any, b: any) => new Date(b.activity_at).getTime() - new Date(a.activity_at).getTime()
            );

            setNotifications(sortedNotifications.slice(0, limit));

            // Update whether there are more notifications to load
            setHasMore(limit < sortedNotifications.length);

            const unreadCount = sortedNotifications.filter(
                (notification: any) => !notification.read
            ).length;

            setNewNotificationsCount(unreadCount);
            setLoading(false); // Stop loading after success
        },
        onError: (err: any) => {
            console.error(err);
            setLoading(false); // Stop loading if there is an error
        },
    });

    useEffect(() => {
        setLoading(true);
        getNotify({}); // Added `all: 1` to include all notifications
    }, [limit]);

    const goContract = (item: any) => {
        open('/apps/contract/' + item.contract_id + '/' + item.contract_uuid, '_blank');
    };

    const calculateTimeAgo = (activity_at: string): string => {
        const now = new Date();
        now.setHours(now.getHours() + 7); // ปรับเวลาให้เป็น GMT+7
        const formattedISO = now.toISOString();

        const date1 = new Date(formattedISO);
        const date2 = new Date(activity_at);

        const diffInMilliseconds = date1.getTime() - date2.getTime();

        if (diffInMilliseconds > 0) {
            const diffInSeconds = Math.floor(diffInMilliseconds / 1000);
            const diffInMinutes = Math.floor(diffInSeconds / 60);
            const diffInHours = Math.floor(diffInMinutes / 60);
            const diffInDays = Math.floor(diffInHours / 24);
            const diffInWeeks = Math.floor(diffInDays / 7);
            const diffInMonths = Math.floor(diffInDays / 30);

            if (diffInMinutes < 60) {
                return `${diffInMinutes} ${t('notification_minutes_ago')}`;
            } else if (diffInHours < 24) {
                return `${diffInHours} ${t('notification_hours_ago')}`;
            } else if (diffInDays < 7) {
                return `${diffInDays} ${t('notification_days_ago')}`;
            } else if (diffInWeeks < 4) {
                return `${diffInWeeks} ${t('notification_weeks_ago')}`;
            } else {
                return `${diffInMonths} ${t('notification_months_ago')}`;
            }
        } else {
            return `1 ${t('notification_minutes_ago')}`;
        }
    };

    // Function to load more notifications
    const loadMoreNotifications = () => {
        setLoading(true);
        setLimit((prevLimit) => prevLimit + 10);
    };

    return (
        <div>
            <div className="panel px-0 ">
                <div className="mb-4.5 px-5 md:items-center md:flex-row flex-col gap-5">
                    <div className={`notification-header px-5 py-4 flex items-center justify-between bg-themePrimary text-white`}>
                        <h4 className="text-lg font-bold">{t('notification_title')}</h4>
                        <div className="notification-tabs flex gap-4">
                            {/* Tabs for filtering notifications can be added here */}
                        </div>
                    </div>
                    <div className="notification-content px-5 py-4">
                        {notifications.length > 0 ? (
                            notifications.map((notification: any) => {
                                if (!notification?.id) return null;

                                const isRead = notification.read;

                                // const containsUnderReviewText = notification.title.includes("อยู่ระหว่างการพิจารณา");

                                // const titleParts = notification.title.split("อยู่ระหว่างการพิจารณา");

                                const titleParts = notification.title.split(" ");

                                return (
                                    <li
                                        key={notification.id}
                                        className={`flex items-center px-4 py-3 border-b border-orange-500 ${isRead ? '' : 'bg-gray-200 dark:bg-gray-800'
                                            }`}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (!isRead) {
                                                markAsRead(notification);
                                            }
                                            goContract(notification);
                                        }}
                                    >
                                        <div className="grid place-content-center rounded-full border-2 border-gray-300 w-[50px] h-[50px] relative">
                                            <img className="w-[50%] h-[50%] object-cover mx-auto absolute inset-0 m-auto" alt="profile" src="/assets/images/iconDoc.png" />
                                            {!isRead && <span className="bg-success w-[15%] h-[15%] rounded-full block absolute right-[6px] bottom-0"></span>}
                                        </div>
                                        <div className="ml-3 flex-1">
                                            <div className="flex flex-col">
                                                <span>
                                                    {/* {titleParts[0]}
                                                    {containsUnderReviewText && (
                                                        <span className="text-orange-500">อยู่ระหว่างการพิจารณา</span>
                                                    )}
                                                    {titleParts[1]} */}
                                                    {titleParts[0] + ' ' + titleParts[1] + ' ' }
                                                    <span className="text-orange-500">{titleParts[2]}</span>
                                                </span>
                                                <span className="text-xs blue font-normal active">
                                                    {calculateTimeAgo(notification.activity_at)}
                                                </span>
                                            </div>
                                        </div>
                                    </li>
                                );
                            })
                        ) : (
                            <div className="flex items-center justify-center py-8">
                                <div className="flex flex-col items-center">
                                    <IconInfoCircle fill={true} className="w-10 h-10 text-primary mb-4" />
                                    <p className="text-lg text-center">{t('notification_no_data')}</p>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="flex justify-center mt-4 p-4">
                        {hasMore && (
                            <button className="btn btn-primary" onClick={loadMoreNotifications} disabled={loading}>
                                {loading ? t('notification_loading') : t('notification_view_previous')}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default List;
