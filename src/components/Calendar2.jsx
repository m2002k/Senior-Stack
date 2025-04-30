import { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import { formatDate } from "@fullcalendar/core";
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import {
    Box,
    List,
    ListItem,
    ListItemText,
    Typography,
    useTheme,
    Chip
} from '@mui/material';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase-config';


const Calendar2 = () => {
    const theme = useTheme();
    const [currentEvents, setCurrentEvents] = useState([]);

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, 'tasks'));
                const tasks = querySnapshot.docs.map(doc => {
                    const data = doc.data();
                    return {
                        id: doc.id,
                        title: data.title,
                        start: data.deadline.toDate(),
                        type: data.type,
                        allDay: false
                    };
                });
                setCurrentEvents(tasks);
            } catch (error) {
                console.error('Error fetching tasks:', error);
            }
        };

        fetchTasks();
    }, []);

    const getEventColor = (type) => {
        switch (type) {
            case 'deadline':
                return theme.palette.error.main;
            case 'meeting':
                return theme.palette.info.main;
            case 'presentation':
                return theme.palette.success.main;
            default:
                return theme.palette.primary.main;
        }
    };

    return (
        <Box m="20px">
            <Typography variant="h4" sx={{ mb: 2 }}>Calendar</Typography>

            <Box display="flex" justifyContent="space-between">
                {/* Calendar */}
                <Box flex="1 1 100%" mr="15px">
                    <FullCalendar
                        height="75vh"
                        plugins={[
                            dayGridPlugin,
                            timeGridPlugin,
                            interactionPlugin,
                            listPlugin
                        ]}
                        headerToolbar={{
                            left: "prev,next today",
                            center: "title",
                            right: "dayGridMonth,timeGridWeek,timeGridDay,listMonth"
                        }}
                        initialView="dayGridMonth"
                        editable={false}
                        selectable={false}
                        selectMirror={false}
                        dayMaxEvents={true}
                        events={currentEvents}
                        eventContent={(eventInfo) => {
                            return (
                                <div style={{ 
                                    backgroundColor: getEventColor(eventInfo.event.extendedProps.type),
                                    color: 'white',
                                    padding: '2px 5px',
                                    borderRadius: '3px',
                                    margin: '1px 0'
                                }}>
                                    {eventInfo.event.title}
                                </div>
                            );
                        }}
                    />
                </Box>

                {/* Sidebar */}
                <Box
                    flex="1 1 20%"
                    backgroundColor={theme.palette.background.alt}
                    p="15px"
                    borderRadius="4px"
                >
                    <Typography variant="h5">Upcoming Events</Typography>
                    <List>
                        {currentEvents.map((event) => (
                            <ListItem
                                key={event.id}
                                sx={{
                                    backgroundColor: getEventColor(event.type),
                                    margin: "10px 0",
                                    borderRadius: "2px",
                                    color: 'white'
                                }}
                            >
                                <ListItemText
                                    primary={event.title}
                                    secondary={
                                        <Typography sx={{ color: 'white' }}>
                                            {formatDate(event.start, {
                                                year: "numeric",
                                                month: "short",
                                                day: "numeric",
                                                ...(!event.allDay && { hour: "numeric", minute: "numeric" })
                                            })}
                                        </Typography>
                                    }
                                />
                                <Chip 
                                    label={event.type} 
                                    size="small" 
                                    sx={{ 
                                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                        color: 'white',
                                        marginLeft: '8px'
                                    }}
                                />
                            </ListItem>
                        ))}
                    </List>
                </Box>
            </Box>
        </Box>
    );
};

export default Calendar2;