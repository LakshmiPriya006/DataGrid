"use client";

import React, { useState, useRef, useEffect } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Checkbox,
    IconButton,
    Chip,
    Tabs,
    Tab,
    Box,
    Collapse,
    Typography,
    Button,
    Menu,
    MenuItem,
    FormControl,
    Select,
    InputLabel,
    Toolbar,
    AppBar,
    Drawer,
    Switch,
    TextField
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import {
    ExpandMore,
    ChevronRight,
    FilterList,
    MoreVert,
    GetApp,
    Check,
    Close,
    Person,
    Schedule,
    Sort,
    TurnRight as TurnRightIcon,
    Menu as MenuIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

// Styled components with custom styling
const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
    height: 'calc(100vh - 200px)',
    position: 'relative'
}));

const StyledTable = styled(Table)(({ theme }) => ({
    minWidth: 1000
}));

const FixedTableHead = styled(TableHead)(({ theme }) => ({
    position: 'sticky',
    top: 0,
    zIndex: 20,
    '& .MuiTableRow-root': {
        minHeight: 32,
        height: 40,
    },
    '& .MuiTableCell-root': {
        paddingTop: 4,
        paddingBottom: 4,
        minHeight: 32,
        height: 40,
    },
}));

const FixedNameCell = styled(TableCell)(({ theme }) => ({
    position: 'sticky',
    left: 0,
    zIndex: 10,
}));

const FixedNameHeaderCell = styled(TableCell)(({ theme }) => ({
    position: 'sticky',
    left: 0,
    zIndex: 30,
    backgroundColor: theme.palette.grey[50],
}));

const ProjectTable = () => {
    // Sidebar state
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [tabs, setTabs] = useState([
        { id: 0, name: '2D Layout', active: true },
        { id: 1, name: '3D Layout', active: false }
    ]);
    const [newTabName, setNewTabName] = useState('');
    const [activeTab, setActiveTab] = useState(0); // 0 for 2D, 1 for 3D
    const [expandedRows, setExpandedRows] = useState(new Set());
    const [selectedRows, setSelectedRows] = useState(new Set());
    const [sortOrder, setSortOrder] = useState('asc');
    const [filterMenuAnchor, setFilterMenuAnchor] = useState(null);
    const [lastVisitedFilter, setLastVisitedFilter] = useState('');
    const [columnWidths, setColumnWidths] = useState({
        name: 300,
        tags: 150,
        uploadedBy: 200,
        uploadedOn: 180,
        status: 120
    });

    const tableRef = useRef(null);
    const [isResizing, setIsResizing] = useState(null);
    const [startX, setStartX] = useState(null);
    const [startWidth, setStartWidth] = useState(null);

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

    // Prepare ordered layout data for both tabs
    const layoutOrder = activeTab === 0 ? [0, 1] : [1, 0];
    const orderedLayouts = layoutOrder.map(i => ({
        label: i === 0 ? '2D Layout' : '3D Layout',
        data: mockData[i]
    }));
    const selectedCount = selectedRows.size;

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    // Sidebar handlers
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
        setTabs(tabs.filter(tab => tab.id !== id));
    };
    const handleAddTab = () => {
        if (newTabName.trim()) {
            setTabs([...tabs, { id: Date.now(), name: newTabName, active: false }]);
            setNewTabName('');
        }
    };

    const handleRowExpand = (rowId) => {
        const newExpanded = new Set(expandedRows);
        if (newExpanded.has(rowId)) {
            newExpanded.delete(rowId);
        } else {
            newExpanded.add(rowId);
        }
        setExpandedRows(newExpanded);
    };

    const handleRowSelect = (rowId, event) => {
        event.stopPropagation();
        const newSelected = new Set(selectedRows);
        if (newSelected.has(rowId)) {
            newSelected.delete(rowId);
        } else {
            newSelected.add(rowId);
        }
        setSelectedRows(newSelected);
    };

    const handleSort = () => {
        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
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

    const clearSelection = () => {
        setSelectedRows(new Set());
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'approved':
                return 'success';
            case 'rejected':
                return 'error';
            case 'pending':
                return 'warning';
            default:
                return 'default';
        }
    };

    const renderActionButtons = (rowId) => (
        <Box className="action-buttons" sx={{ display: 'flex', gap: 0.5 }}>
            <IconButton
                size="small"
                className="action-btn approve-btn"
                sx={{ color: 'success.main', '&:hover': { backgroundColor: 'success.light', opacity: 0.1 } }}
                title="Approve"
            >
                <Check fontSize="small" />
            </IconButton>
            <IconButton
                size="small"
                className="action-btn reject-btn"
                sx={{ color: 'error.main', '&:hover': { backgroundColor: 'error.light', opacity: 0.1 } }}
                title="Reject"
            >
                <Close fontSize="small" />
            </IconButton>
            <IconButton
                size="small"
                className="action-btn download-btn"
                sx={{ color: 'primary.main', '&:hover': { backgroundColor: 'primary.light', opacity: 0.1 } }}
                title="Download"
            >
                <GetApp fontSize="small" />
            </IconButton>
            <IconButton
                size="small"
                className="action-btn more-btn"
                sx={{ color: 'text.secondary', '&:hover': { backgroundColor: 'grey.100' } }}
                title="More options"
            >
                <MoreVert fontSize="small" />
            </IconButton>
        </Box>
    );

    const renderRow = (item, level = 0, isVersion = false, parentId = null) => {
        const rowId = item.id;
        const isSelected = selectedRows.has(rowId);
        const isExpanded = expandedRows.has(rowId);
        const hasChildren = item.previousVersions && item.previousVersions.length > 0;

        return (
            <React.Fragment key={rowId}>
                {/* This is the main, visible row */}
                <TableRow
                    className={`table-row ${isSelected ? 'selected' : ''} ${isVersion ? 'version-row' : 'main-row'} level-${level}`}
                    onClick={() => {
                        if (!isVersion && hasChildren) {
                            handleRowExpand(rowId);
                        }
                    }}
                    sx={{
                        cursor: !isVersion && hasChildren ? 'pointer' : 'default',
                        backgroundColor: isSelected ? 'action.hover' : isVersion ? 'grey.50' : 'inherit',
                        minHeight: 15,
                        height: 15,
                        '& .MuiTableCell-root': {
                            paddingTop: 1,
                            paddingBottom: 1,
                        },
                        '&:hover': {
                            backgroundColor: 'action.hover',
                        }
                    }}
                >
                    <FixedNameCell
                        className="name-cell fixed-column"
                        sx={{
                            width: columnWidths.name,
                            minWidth: 60,
                            backgroundColor: isSelected ? 'action.hover' : 'background.paper'
                        }}
                    >
                        <Box className="name-content" sx={{ display: 'flex', alignItems: 'center', gap: 1, pl: level * 3 }}>
                            <Checkbox
                                size="small"
                                checked={isSelected}
                                onChange={(e) => handleRowSelect(rowId, e)}
                                onClick={(e) => e.stopPropagation()}
                                sx={{ color: 'text.primary', '&.Mui-checked': { color: 'text.primary' } }}
                            />
                            {item.version && (
                                <Chip
                                    label={item.version}
                                    size="small"
                                    sx={{
                                        backgroundColor: 'grey.200',
                                        color: 'text.secondary',
                                        fontSize: '0.75rem',
                                        height: 20
                                    }}
                                />
                            )}
                            <Typography variant="body2" sx={{ fontWeight: isVersion ? 400 : 500 }}>
                                {item.name}
                            </Typography>
                            {item.fileCount && (
                                <Typography variant="caption" color="text.secondary">
                                    {item.fileCount} Files
                                </Typography>
                            )}
                        </Box>
                    </FixedNameCell>

                    <TableCell sx={{ width: columnWidths.tags, minWidth: 60 }}>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {item.tags?.map((tag, index) => (
                                <Chip
                                    key={index}
                                    label={tag}
                                    size="small"
                                    variant="outlined"
                                    sx={{ fontSize: '0.75rem', height: 24 }}
                                />
                            ))}
                        </Box>
                    </TableCell>

                    <TableCell sx={{ width: columnWidths.uploadedBy }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Person fontSize="small" color="disabled" />
                            <Typography variant="body2">{item.uploadedBy}</Typography>
                        </Box>
                    </TableCell>

                    <TableCell sx={{ width: columnWidths.uploadedOn }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Schedule fontSize="small" color="disabled" />
                            <Typography variant="body2">{item.uploadedOn}</Typography>
                        </Box>
                    </TableCell>

                    <TableCell sx={{ width: columnWidths.status }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Chip
                                label={item.status}
                                size="small"
                                color={getStatusColor(item.status)}
                                sx={{ fontSize: '0.75rem', height: 24 }}
                            />
                            {isSelected && renderActionButtons(rowId)}
                        </Box>
                    </TableCell>
                </TableRow>

                {/* CHANGE: The collapsible section is now wrapped in a new TableRow and a TableCell with colSpan. */}
                {hasChildren && !isVersion && (
                    <TableRow>
                        <TableCell style={{ padding: 0, border: 'none' }} colSpan={5}>
                            <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                                <Box sx={{
                                    backgroundColor: 'grey.50',
                                }}>
                                    <Table size="small" aria-label="previous versions">
                                        <TableBody>
                                            <TableRow>
                                                <TableCell colSpan={5} sx={{ borderBottom: 1, borderColor: 'divider', py: 1 }}>
                                                    <Typography variant="subtitle2" sx={{ fontWeight: 600, padding: '0px 40px 0px 40px' }}>
                                                        Previous Versions
                                                    </Typography>
                                                </TableCell>
                                            </TableRow>
                                            {item.previousVersions.map(version =>
                                                renderRow(version, level + 1, true, rowId)
                                            )}
                                        </TableBody>
                                    </Table>
                                </Box>
                            </Collapse>
                        </TableCell>
                    </TableRow>
                )}
            </React.Fragment>
        );
    };

    // Helper: Start resizing
    const handleResizeStart = (col, e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsResizing(col);
        setStartX(e.clientX);
        setStartWidth(columnWidths[col]);
        document.body.style.cursor = 'col-resize';
    };

    // Helper: On mouse move
    useEffect(() => {
        if (!isResizing) return;
        const onMouseMove = (e) => {
            const dx = e.clientX - startX;
            setColumnWidths((prev) => ({
                ...prev,
                [isResizing]: Math.max(60, startWidth + dx)
            }));
        };
        const onMouseUp = () => {
            setIsResizing(null);
            setStartX(null);
            setStartWidth(null);
            document.body.style.cursor = '';
        };
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
        };
    }, [isResizing, startX, startWidth]);

    // Resizer handle component (vertical line)
    const Resizer = ({ col }) => (
        <span
            style={{
                position: 'absolute',
                right: 0,
                top: 0,
                height: '100%',
                width: 6,
                cursor: 'col-resize',
                zIndex: 100,
                userSelect: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
            onMouseDown={(e) => handleResizeStart(col, e)}
        >
            <span style={{
                width: 2,
                height: '70%',
                background: '#d0d7de',
                borderRadius: 1,
                transition: 'background 0.2s',
            }} />
        </span>
    );

    return (
        <Box className="project-table-container" sx={{ width: '100%', height: '100%', bgcolor: 'background.paper' }}>
            {/* Header */}
            <AppBar position="static" color="transparent" elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
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

            {/* Filters Row */}
            {(selectedCount > 0 || lastVisitedFilter) && (
                <Box
                    className="filters-row"
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        p: 1,
                        border: 1,
                        borderColor: 'divider',
                        opacity: 0.8
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
                    {selectedCount > 0 && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Typography variant="body2" sx={{ px: 1, display: 'flex', alignItems: 'center', gap: 1, backgroundColor: 'grey.100', color: 'grey.800', border: 1, borderColor: 'divider', borderRadius: 1, fontWeight: 500 }}>
                                <TurnRightIcon fontSize="small" sx={{ color: 'gray' }} />
                                {selectedCount} row{selectedCount > 1 ? 's' : ''} selected
                            </Typography>
                            <Button
                                size="small"
                                onClick={clearSelection}
                                sx={{ color: 'error.main', textDecoration: 'underline' }}
                            >
                                clear
                            </Button>
                        </Box>
                    )}
                </Box>
            )}

            {/* Tabs */}
            <Box sx={{ border: 1, borderColor: 'divider' }}>
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
            <StyledTableContainer component={Paper} elevation={0} ref={tableRef} sx={{ border: 1, borderColor: 'divider' }}>
                <StyledTable stickyHeader>
                    <FixedTableHead>
                        <TableRow>
                            <FixedNameHeaderCell sx={{ width: columnWidths.name, position: 'relative', minWidth: 60 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Name</Typography>
                                    <IconButton size="small" onClick={handleSort}>
                                        <Sort fontSize="small" />
                                    </IconButton>
                                </Box>
                                <Resizer col="name" />
                            </FixedNameHeaderCell>
                            <TableCell sx={{ width: columnWidths.tags, position: 'relative', minWidth: 60 }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Tags</Typography>
                                <Resizer col="tags" />
                            </TableCell>
                            <TableCell sx={{ width: columnWidths.uploadedBy, position: 'relative', minWidth: 60 }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Uploaded By</Typography>
                                <Resizer col="uploadedBy" />
                            </TableCell>
                            <TableCell sx={{ width: columnWidths.uploadedOn, position: 'relative', minWidth: 60 }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Uploaded on</Typography>
                                <Resizer col="uploadedOn" />
                            </TableCell>
                            <TableCell sx={{ width: columnWidths.status, position: 'relative', minWidth: 60 }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Status</Typography>
                            </TableCell>
                        </TableRow>
                    </FixedTableHead>
                    <TableBody>
                        {orderedLayouts.map(section => (
                            <React.Fragment key={section.label}>
                                <TableRow>
                                    <TableCell colSpan={5} sx={{ backgroundColor: 'grey.100', fontWeight: 600, fontSize: '1rem', py: 1 }}>
                                        {section.label}
                                    </TableCell>
                                </TableRow>
                                {section.data.map(item =>
                                    item.versions.map(version => renderRow(version))
                                )}
                            </React.Fragment>
                        ))}
                    </TableBody>
                </StyledTable>
            </StyledTableContainer>
        </Box>
    );
};

export default ProjectTable;