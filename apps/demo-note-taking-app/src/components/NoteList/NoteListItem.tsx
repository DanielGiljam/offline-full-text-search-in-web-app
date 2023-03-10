import {
    LinearProgress,
    ListItem,
    ListItemButton,
    ListItemText,
    Skeleton,
} from "@mui/material";
import React from "react";

import {Note} from "../../orbit";

export interface NoteListItemProps {
    dataIndex: number;
    note: Note | undefined;
    selectedNote: string | undefined;
    setSelectedNote: (id: string) => void;
}

// eslint-disable-next-line react/display-name
export const NoteListItem = React.forwardRef<HTMLLIElement, NoteListItemProps>(
    (
        {dataIndex, note, selectedNote, setSelectedNote}: NoteListItemProps,
        ref,
    ) => {
        const [isPending, startTransition] = React.useTransition();
        const id = note?.id;
        const title = note?.attributes.title;
        const content = note?.attributes.content;
        return (
            <ListItem ref={ref} data-index={dataIndex} disablePadding>
                <ListItemButton
                    selected={id != null && id === selectedNote}
                    dense
                    disableTouchRipple
                    divider
                    onClick={() => {
                        if (id != null) {
                            startTransition(() => setSelectedNote(id));
                        }
                    }}
                >
                    {isPending && (
                        <LinearProgress
                            sx={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                right: 0,
                            }}
                        />
                    )}
                    <ListItemText
                        primary={
                            title != null ? (
                                title.length === 0 ? (
                                    "Untitled"
                                ) : (
                                    title
                                )
                            ) : (
                                <Skeleton />
                            )
                        }
                        primaryTypographyProps={{
                            noWrap: true,
                            sx: [title?.length === 0 && {fontStyle: "italic"}],
                        }}
                        secondary={
                            content != null ? (
                                content.length === 0 ? (
                                    "No content"
                                ) : (
                                    content
                                )
                            ) : (
                                <Skeleton />
                            )
                        }
                        secondaryTypographyProps={{
                            sx: [
                                {
                                    display: "-webkit-box",
                                    overflow: "hidden",
                                    WebkitBoxOrient: "vertical",
                                    WebkitLineClamp: "3",
                                },
                                content?.length === 0 && {fontStyle: "italic"},
                            ],
                        }}
                    />
                </ListItemButton>
            </ListItem>
        );
    },
);
