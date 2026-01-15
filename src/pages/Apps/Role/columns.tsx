
export const columns = [
  {
    accessor: 'name',
    title: t('menu.menu_name'),
    sortable: false,
    render: (item: Menu) => (
      <div className="flex items-center" style={{ paddingLeft: `${(item.level || 0) * 30}px` }}>
        {item.children && item.children.length > 0 ? (
          <button
            onClick={() => toggleRow(item.id)}
            className="mr-2 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          >
            <IconCaretDown
              className={`transition-transform duration-200 w-4 h-4 ${
                expandedRows.includes(item.id) ? '' : '-rotate-90'
              }`}
            />
          </button>
        ) : (
          <span className="mr-2 w-6"></span>
        )}
        <div className="flex flex-col">
          <span className="font-semibold text-gray-900 dark:text-white">{item.name}</span>
          {item.name_en && (
            <span className="text-xs text-gray-500 dark:text-gray-400">{item.name_en}</span>
          )}
        </div>
      </div>
    ),
  },
  {
    accessor: 'menu_type',
    title: t('menu.type'),
    sortable: false,
    textAlignment: 'center',
    width: 100,
    render: (item: Menu) => getMenuTypeBadge(item.menu_type),
  },
  {
    accessor: 'path',
    title: t('menu.path'),
    sortable: false,
    width: 160,
    render: (item: Menu) => (
      <div className="font-mono text-xs text-gray-600 dark:text-gray-300">
        {item.path === '#' ? '-' : item.path}
      </div>
    ),
  },
  // {
  //   accessor: 'icon',
  //   title: t('menu.icon'),
  //   sortable: false,
  //   textAlignment: 'center',
  //   width: 120,
  //   render: (item: Menu) => (
  //     <div className="text-xs text-gray-500">{item.icon || '-'}</div>
  //   ),
  // },
  {
    accessor: 'sort_order',
    title: t('menu.sort_order'),
    sortable: false,
    textAlignment: 'center',
    width: 120,
    render: (item: Menu) => (
      <span className="font-mono text-sm">{item.sort_order}</span>
    ),
  },
  {
    accessor: 'visible',
    title: t('menu.visible'),
    sortable: false,
    textAlignment: 'center',
    width: 100,
    render: (item: Menu) => getVisibleBadge(item.visible),
  },
  {
    accessor: 'status',
    title: t('menu.status'),
    sortable: false,
    textAlignment: 'center',
    width: 100,
    render: (item: Menu) => getStatusBadge(item.status),
  },
  {
    accessor: 'action',
    title: t('menu.actions'),
    textAlignment: 'center',
    fixed: 'right',
    sortable: false,
    width: 150,
    render: (item: Menu) => (
      <div className="flex gap-4 items-center justify-center">
        <button
          className="hover:text-info transition-colors"
          onClick={() => goView(item)}
          title={t('menu.view')}
        >
          <IconEye className="w-4.5 h-4.5" />
        </button>
        <button
          className="hover:text-primary transition-colors"
          onClick={() => openEditModal(item)}
          title={t('menu.edit')}
        >
          <IconEdit className="w-4.5 h-4.5" />
        </button>
        <button
          className="hover:text-danger transition-colors"
          onClick={() => handleDelete(item)}
          title={t('menu.delete')}
        >
          <IconTrash className="w-4.5 h-4.5" />
        </button>
      </div>
    ),
  },
]