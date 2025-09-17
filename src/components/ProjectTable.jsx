"use client";

import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
    IconButton,
    Chip,
    Tabs,
    Tab,
    Box,
    Typography,
    Button,
    Menu,
    MenuItem,
    Toolbar,
    AppBar,
    Drawer,
    Switch,
    TextField
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { DataGridPro, GridActionsCellItem, useGridApiRef } from '@mui/x-data-grid-pro';
import {
    FilterList,
    MoreVert,
    GetApp,
    Check,
    Close,
    Person,
    Schedule,
    TurnRight as TurnRightIcon,
    Menu as MenuIcon
} from '@mui/icons-material';

const ProjectTable = () => {

    console.log('--- CHECKING FILE VERSION: THIS IS THE LATEST CODE ---');
    // Sidebar state
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [tabs, setTabs] = useState([
        { id: 0, name: '2D Layout', active: true },
        { id: 1, name: '3D Layout', active: false }
    ]);
    const [newTabName, setNewTabName] = useState('');
    const [activeTab, setActiveTab] = useState(0); // 0 for 2D, 1 for 3D

    const apiRef = useGridApiRef();
    const [rowSelectionModel, setRowSelectionModel] = useState([]);
    const [filterMenuAnchor, setFilterMenuAnchor] = useState(null);
    const [lastVisitedFilter, setLastVisitedFilter] = useState('');

    // Mock data structure
    const mockData = {
        0: [ // 2D Layout
            {
                id: '2d-layout',
                name: '2D Layout',
                fileCount: 7,
                versions: [
                    {
                        id: 'v3-2d',
                        version: 'V3',
                        name: 'Floor Plan - Ground floor',
                        tags: ['Elevation', 'Floors'],
                        uploadedBy: 'Rahul Sharma, Kiran',
                        uploadedOn: '29 May 2024, 8:30 pm',
                        status: 'Approved',
                        previousVersions: [
                            {
                                id: 'v2-2d',
                                version: 'V2',
                                name: 'Floor Plan - Ground floor',
                                tags: ['Elevation', 'Floors'],
                                uploadedBy: 'Rahul Sharma, Kiran',
                                uploadedOn: '28 May 2024, 7:15 pm',
                                status: 'Approved'
                            },
                            {
                                id: 'v1-2d',
                                version: 'V1',
                                name: 'Floor Plan - Ground floor',
                                tags: ['Elevation', 'Floors'],
                                uploadedBy: 'Rahul Sharma, Kiran',
                                uploadedOn: '27 May 2024, 6:00 pm',
                                status: 'Rejected'
                            }
                        ]
                    }
                ]
            }
        ],
        1: [ // 3D Layout
            {
                id: '3d-layout',
                name: '3D Layout',
                fileCount: 7,
                versions: [
                    {
                        id: 'v3-3d',
                        version: 'V3',
                        name: 'Floor Plan - Ground floor',
                        tags: ['Elevation', 'Floors'],
                        uploadedBy: 'Rahul Sharma, Kiran',
                        uploadedOn: '29 May 2024, 8:30 pm',
                        status: 'Approved',
                        previousVersions: []
                    }
                ]
            }
        ]
    };

    const processedRows = useMemo(() => {
        const flatRows = [];

        const processNode = (node, parentPath = [], isHistoric = false) => {
            // 1. Add the current node
            flatRows.push({
                ...node,
                path: [...parentPath, node.id],
                isHistoric,
            });

            // 2. Process 'versions' as direct children (these are not historic)
            if (node.versions) {
                node.versions.forEach(child => processNode(child, [...parentPath, node.id], false));
            }

            // 3. Process 'previousVersions' under a synthetic "Previous Versions" group
            if (node.previousVersions && node.previousVersions.length > 0) {
                const syntheticParentId = `previous-versions-${node.id}`;

                // Add the synthetic "Previous Versions" row, marked as historic
                flatRows.push({
                    id: syntheticParentId,
                    name: 'Previous Versions',
                    path: [...parentPath, node.id, syntheticParentId],
                    isHistoric: true,
                });

                // Process the actual previous versions as children, marking them as historic
                node.previousVersions.forEach(child =>
                    processNode(child, [...parentPath, node.id, syntheticParentId], true)
                );
            }
        };

        // This kicks off the process for each top-level item
        Object.keys(mockData).forEach(key => {
            const layout = mockData[key][0];
            if (layout) {
                processNode(layout); // Initial call with isHistoric = false
            }
        });

        return flatRows;
    }, [mockData]);

    const activeRows = useMemo(() => {
        // Get the correct ID from the mockData based on the active tab
        const activeLayoutId = mockData[activeTab]?.[0]?.id;
        if (!activeLayoutId) {
            return [];
        }
        // Filter the rows where the first item in their path matches the active ID
        return processedRows.filter(row => row.path[0] === activeLayoutId);
    }, [processedRows, activeTab]);

    const selectableRows = useMemo(() =>
        activeRows.filter(row => !row.isHistoric).map(row => row.id),
        [activeRows]
    );

    const selectedCount = rowSelectionModel.filter(id => selectableRows.includes(id)).length;
    const isAllSelected = selectedCount === selectableRows.length && selectableRows.length > 0;
    const isIndeterminate = selectedCount > 0 && selectedCount < selectableRows.length;

    const handleSelectAllClick = (event) => {
        if (event.target.checked) {
            setRowSelectionModel(selectableRows);
        } else {
            setRowSelectionModel([]);
        }
    };

    // NECESSARY CHANGE: Define this complete configuration array
    const columns = [
        // This column's content is now handled by the `groupingColDef` prop 
        // on DataGridPro when `treeData` is enabled, which combines the data
        // from this field with the expansion arrows.
        // {
        //     field: 'name',
        //     headerName: 'Name',
        //     width: 250,
        //     renderCell: ({ row }) => (
        //         <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        //             {row.version && <Chip label={row.version} size="small" sx={{ backgroundColor: 'grey.200', color: 'text.secondary' }} />}
        //             <Typography variant="body2">{row.name}</Typography>
        //         </Box>
        //     )
        // },
        {
            field: 'tags',
            headerName: 'Tags',
            width: 180,
            sortable: false, // Tags are not typically sortable
            align: 'center',
            headerAlign: 'center',
            renderCell: ({ value, row }) => {
                if (row.id === '2d-layout' || row.id === '3d-layout' || row.id.startsWith('previous-versions-')) return null;
                return (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                        {value?.map((tag, index) => (
                            <Chip
                                key={index}
                                label={tag}
                                size="small"
                                variant="outlined"
                            />
                        ))}
                    </Box>
                )
            }
        },
        {
            field: 'uploadedBy',
            headerName: 'Uploaded By',
            width: 220,
            align: 'center',
            headerAlign: 'center',
            renderCell: ({ value, row }) => {
                if (row.id === '2d-layout' || row.id === '3d-layout' || row.id.startsWith('previous-versions-')) return null;
                return (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center', height: '100%' }}>
                        <Person fontSize="small" color="disabled" />
                        <Typography variant="body2">{value}</Typography>
                    </Box>
                )
            }
        },
        {
            field: 'uploadedOn',
            headerName: 'Uploaded On',
            width: 220,
            align: 'center',
            headerAlign: 'center',
            renderCell: ({ value, row }) => {
                if (row.id === '2d-layout' || row.id === '3d-layout' || row.id.startsWith('previous-versions-')) return null;
                return (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center', height: '100%' }}>
                        <Schedule fontSize="small" color="disabled" />
                        <Typography variant="body2">{value}</Typography>
                    </Box>
                )
            }
        },
        {
            field: 'status',
            headerName: 'Status',
            width: 120,
            align: 'center',
            headerAlign: 'center',
            renderCell: ({ value, row }) => {
                if (row.id === '2d-layout' || row.id === '3d-layout' || row.id.startsWith('previous-versions-')) return null;
                const colorMap = {
                    approved: 'success',
                    rejected: 'error',
                    pending: 'warning',
                };
                return (
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                        <Chip
                            label={value}
                            size="small"
                            color={colorMap[value?.toLowerCase()] || 'default'}
                        />
                    </Box>
                );
            }
        },
        // This replaces your manual renderActionButtons() function
        {
            field: 'actions',
            type: 'actions',
            headerName: 'Actions',
            width: 150,
            align: 'center',
            headerAlign: 'center',
            getActions: (params) => {
                if (params.id === '2d-layout' || params.id === '3d-layout' || params.id.startsWith('previous-versions-')) return [];
                return [
                    <GridActionsCellItem
                        icon={<Check fontSize="small" />}
                        label="Approve"
                        title="Approve"
                    // onClick={...}
                    />,
                    <GridActionsCellItem
                        icon={<Close fontSize="small" />}
                        label="Reject"
                        title="Reject"
                    // onClick={...}
                    />,
                    <GridActionsCellItem
                        icon={<GetApp fontSize="small" />}
                        label="Download"
                        title="Download"
                    // onClick={...}
                    />,
                    <GridActionsCellItem
                        icon={<MoreVert fontSize="small" />}
                        label="More"
                        title="More options"
                    // onClick={...}
                    />,
                ]
            },
        },
    ];

    const handleRowClick = (params) => {
        const rowNode = apiRef.current.getRowNode(params.id);
        if (!rowNode) return;

        const isExpanding = !rowNode.childrenExpanded;
        apiRef.current.setRowChildrenExpansion(params.id, isExpanding);

        // If we are expanding a row that has previous versions, also expand the synthetic child
        if (isExpanding) {
            const rowData = processedRows.find(r => r.id === params.id);
            if (rowData?.previousVersions?.length > 0) {
                const syntheticChildId = `previous-versions-${params.id}`;
                // Use a timeout to ensure the grid can process the first expansion before the second
                setTimeout(() => {
                    apiRef.current.setRowChildrenExpansion(syntheticChildId, true);
                }, 0);
            }
        }
    };

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };
    const handleMenuTabClick = () => setSidebarOpen(true);
    const handleSidebarClose = () => setSidebarOpen(false);
    const handleToggleTab = (id) => {
        setTabs(tabs.map(tab => ({ ...tab, active: tab.id === id })));
        setActiveTab(id);
    };
    const handleEditTab = (id) => {
        // Implement edit logic (e.g., open input for renaming)
    };
    const handleDeleteTab = (id) => {
        const updatedTabs = tabs.filter(tab => tab.id !== id);
        setTabs(updatedTabs);

        // If the deleted tab was the active one,
        // fall back to the first available tab or reset if none are left.
        if (activeTab === id) {
            if (updatedTabs.length > 0) {
                setActiveTab(updatedTabs[0].id);
            } else {
                setActiveTab(0); // Or -1 if you want no tab selected
            }
        }
    };

    const handleAddTab = () => {
        if (newTabName.trim()) {
            setTabs([...tabs, { id: Date.now(), name: newTabName, active: false }]);
            setNewTabName('');
        }
    };



    const handleFilterMenuOpen = (event) => {
        setFilterMenuAnchor(event.currentTarget);
    };

    const handleFilterMenuClose = () => {
        setFilterMenuAnchor(null);
    };

    const handleFilterSelect = (filter) => {
        setLastVisitedFilter(filter);
        handleFilterMenuClose();
    };

    return (
        <Box className="project-table-container" sx={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100vh', bgcolor: 'background.paper' }}>
            {/* Header */}
            <AppBar position="static" color="transparent" elevation={0} sx={{ border: 1, borderColor: 'divider', flexShrink: 0 }}>
                <Toolbar sx={{ justifyContent: 'space-between' }}>
                    <Box>
                        <Typography variant="h6" component="h2" sx={{ fontWeight: 600 }}>
                            Project Name
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Project code
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <IconButton onClick={handleFilterMenuOpen}>
                            <FilterList />
                        </IconButton>
                        <IconButton>
                            <MoreVert />
                        </IconButton>
                        <Button
                            variant="outlined"
                            size="small"
                            sx={{
                                color: 'primary.main',
                                borderColor: 'primary.main',
                                '&:hover': { backgroundColor: 'primary.main', opacity: 0.1, color: 'white' }
                            }}
                        >
                            Page Tips
                        </Button>
                    </Box>
                </Toolbar>
            </AppBar>

            {/* Filter Menu */}
            <Menu
                anchorEl={filterMenuAnchor}
                open={Boolean(filterMenuAnchor)}
                onClose={handleFilterMenuClose}
            >
                <MenuItem onClick={() => handleFilterSelect('August 2025')}>August 2025</MenuItem>
                <MenuItem onClick={() => handleFilterSelect('July 2025')}>July 2025</MenuItem>
                <MenuItem onClick={() => handleFilterSelect('June 2025')}>June 2025</MenuItem>
                <MenuItem onClick={() => handleFilterSelect('May 2024')}>May 2024</MenuItem>
            </Menu>

            {/* Tabs */}
            <Box sx={{ border: 1, borderColor: 'divider', flexShrink: 0 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Tab
                        icon={<MenuIcon />}
                        aria-label="menu"
                        onClick={handleMenuTabClick}
                    />
                    <Box sx={{ width: '1px', height: 32, bgcolor: 'divider', alignSelf: 'center', mx: 1 }} />
                    <Tabs
                        value={activeTab}
                        onChange={handleTabChange}
                        sx={{
                            '& .MuiTab-root': {
                                textTransform: 'none',
                                fontWeight: 500,
                                '&.Mui-selected': {
                                    color: 'error.main',
                                    opacity: 0.8
                                }
                            },
                            '& .MuiTabs-indicator': {
                                backgroundColor: 'error.main'
                            }
                        }}
                    >
                        {tabs.map(tab => (
                            <Tab key={tab.id} label={tab.name} />
                        ))}
                    </Tabs>
                </Box>
            </Box>

            {(rowSelectionModel.length > 0 || lastVisitedFilter) && (
                <Box
                    className="filters-row"
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        p: 1,
                        border: 1,
                        borderColor: 'divider',
                        opacity: 0.8,
                        flexShrink: 0
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {lastVisitedFilter && (
                            <Chip
                                label={`Last visited ${lastVisitedFilter}`}
                                onDelete={() => setLastVisitedFilter('')}
                                size="small"
                                sx={{ backgroundColor: 'gray-100', color: 'gray', border: 1, borderColor: 'divider', borderRadius: 1 }}
                            />
                        )}
                    </Box>
                    {rowSelectionModel.length > 0 && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Typography variant="body2" sx={{ px: 1, display: 'flex', alignItems: 'center', gap: 1, backgroundColor: 'grey.100', color: 'grey.800', border: 1, borderColor: 'divider', borderRadius: 1, fontWeight: 500 }}>
                                <TurnRightIcon fontSize="small" sx={{ color: 'gray' }} />
                                {rowSelectionModel.length} row{rowSelectionModel.length > 1 ? 's' : ''} selected
                            </Typography>
                            <Button
                                size="small"
                                onClick={
                                    () => setRowSelectionModel([])
                                }
                                sx={{ color: 'error.main', textDecoration: 'underline' }}
                            >
                                clear
                            </Button>
                        </Box>
                    )}
                </Box>
            )}

            {/* Sidebar Drawer */}
            <Drawer anchor="right" open={sidebarOpen} onClose={handleSidebarClose}>
                <Box sx={{ width: 340, p: 2 }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>Sections</Typography>
                    {tabs.map(tab => (
                        <Box key={tab.id} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <MenuIcon sx={{ mr: 1, color: 'grey.500' }} />
                            <Typography sx={{ flex: 1 }}>{tab.name}</Typography>
                            <Switch checked={tab.active} onChange={() => handleToggleTab(tab.id)} color="primary" />
                            <IconButton size="small" onClick={() => handleEditTab(tab.id)}><EditIcon sx={{ color: 'grey.700' }} /></IconButton>
                            <IconButton size="small" onClick={() => handleDeleteTab(tab.id)}><DeleteIcon sx={{ color: 'error.main' }} /></IconButton>
                        </Box>
                    ))}
                    <TextField
                        variant="outlined"
                        size="small"
                        placeholder="New"
                        value={newTabName}
                        onChange={e => setNewTabName(e.target.value)}
                        sx={{ mt: 2, width: '100%' }}
                        onKeyDown={e => { if (e.key === 'Enter') handleAddTab(); }}
                    />
                    <Button variant="contained" color="primary" sx={{ mt: 1, width: '100%' }} onClick={handleAddTab}>Add</Button>
                </Box>
            </Drawer>

            {/* Table */}

            <Box sx={{ flexGrow: 1, height: '100%' }}>
                <DataGridPro
                    rows={activeRows}
                    columns={columns}
                    apiRef={apiRef}
                    
                    treeData
                    groupingColDef={{
                        headerName: 'Name',
                        width: 300,
                        field: 'name', // This is important
                        renderHeader: (params) => (
                            <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                                <Checkbox
                                    checked={isAllSelected}
                                    indeterminate={isIndeterminate}
                                    onChange={handleSelectAllClick}
                                />
                                <Typography variant="subtitle2">Name</Typography>
                            </Box>
                        ),
                        renderCell: (params) => (
                            <Box sx={{ display: 'flex', alignItems: 'center', height: '100%', ml: params.rowNode.depth * 2 }}>
                                {!params.row.isHistoric && (
                                    <Checkbox
                                        checked={rowSelectionModel.includes(params.id)}
                                        onChange={(event) => {
                                            event.stopPropagation();
                                            const newSelectionModel = rowSelectionModel.includes(params.id)
                                                ? rowSelectionModel.filter((id) => id !== params.id)
                                                : [...rowSelectionModel, params.id];
                                            setRowSelectionModel(newSelectionModel);
                                        }}
                                        onClick={(event) => event.stopPropagation()}
                                    />
                                )}
                                {params.row.version && <Chip label={params.row.version} size="small" sx={{ backgroundColor: 'grey.200', color: 'text.secondary', ml: 1 }} />}
                                <Typography variant="body2" sx={{ ml: params.row.isHistoric ? 0 : 1 }}>{params.row.name}</Typography>
                            </Box>
                        )
                    }}
                    getTreeDataPath={(row) => row.path}
                    initialState={{
                        expansion: {
                            '2d-layout': true,
                            '3d-layout': true,
                        }
                    }}
                    disableIconOpenInGroupingCol={true}
                    onRowClick={handleRowClick}
                    // rowSelectionModel={rowSelectionModel}
                    // onRowSelectionModelChange={(newModel) => setRowSelectionModel(newModel)}
                    onSelectionModelChange={(newSelectionModel) => {
                        setRowSelectionModel(newSelectionModel);
                    }}
                />

            </Box>
        </Box>
    );
};

export default ProjectTable;