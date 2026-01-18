import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    CommandDialog,
    CommandInput,
    CommandList,
    CommandEmpty,
    CommandGroup,
    CommandItem,
    CommandSeparator,
    CommandShortcut,
} from '@/components/ui/command'
import { CheckCircle2, Inbox, LayoutDashboard, PlusSquare, Search } from 'lucide-react'

interface CommandPaletteProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

interface CommandAction {
    id: string
    label: string
    keywords: string[]
    action: () => void
    icon?: React.ReactNode
    shortcut?: string
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
    const navigate = useNavigate()
    const [query, setQuery] = useState('')

    useEffect(() => {
        if (!open) {
            setQuery('')
        }
    }, [open])

    const frequentActions: CommandAction[] = useMemo(() => [
        {
            id: 'create-leave',
            label: '发起请假申请',
            keywords: ['请假', '年假', '休假', 'LEAVE'],
            action: () => navigate('/approval/new?type=LEAVE'),
            icon: <PlusSquare className="h-4 w-4" />,
            shortcut: 'N',
        },
        {
            id: 'create-expense',
            label: '发起报销申请',
            keywords: ['报销', '费用', 'EXPENSE'],
            action: () => navigate('/approval/new?type=EXPENSE'),
            icon: <PlusSquare className="h-4 w-4" />,
        },
        {
            id: 'open-todo',
            label: '打开待办列表',
            keywords: ['待办', 'todo'],
            action: () => navigate('/approval?tab=todo'),
            icon: <Inbox className="h-4 w-4" />,
        },
    ], [navigate])

    const navigationActions: CommandAction[] = useMemo(() => [
        {
            id: 'open-done',
            label: '打开已办列表',
            keywords: ['已办', 'done', '完成'],
            action: () => navigate('/approval?tab=done'),
            icon: <CheckCircle2 className="h-4 w-4" />,
        },
        {
            id: 'open-dashboard',
            label: '进入数据看板',
            keywords: ['看板', 'dashboard', '统计'],
            action: () => navigate('/dashboard'),
            icon: <LayoutDashboard className="h-4 w-4" />,
        },
    ], [navigate])

    const matchedActions = useMemo(() => {
        if (!query.trim()) return []
        const keyword = query.toLowerCase()
        return [...frequentActions, ...navigationActions].filter((item) =>
            item.keywords.some((k) => k.toLowerCase().includes(keyword)) ||
            item.label.toLowerCase().includes(keyword)
        )
    }, [frequentActions, navigationActions, query])

    const handleAction = (action: () => void) => {
        action()
        onOpenChange(false)
    }

    return (
        <CommandDialog open={open} onOpenChange={onOpenChange} title="命令面板" description="搜索或快速执行审批操作">
            <CommandInput
                placeholder="搜索审批类型、人员或操作..."
                value={query}
                onValueChange={setQuery}
            />
            <CommandList>
                <CommandEmpty>未找到匹配的结果</CommandEmpty>

                {query.trim() && (
                    <CommandGroup heading="智能匹配">
                        {matchedActions.length > 0 ? (
                            matchedActions.map((item) => (
                                <CommandItem key={item.id} onSelect={() => handleAction(item.action)}>
                                    {item.icon}
                                    <span>{item.label}</span>
                                    {item.shortcut && <CommandShortcut>{item.shortcut}</CommandShortcut>}
                                </CommandItem>
                            ))
                        ) : (
                            <CommandItem onSelect={() => handleAction(() => navigate(`/approval?query=${encodeURIComponent(query)}`))}>
                                <Search className="h-4 w-4" />
                                <span>搜索 “{query}” 的审批记录</span>
                                <CommandShortcut>↵</CommandShortcut>
                            </CommandItem>
                        )}
                    </CommandGroup>
                )}

                <CommandSeparator />

                <CommandGroup heading="常用推荐">
                    {frequentActions.map((item) => (
                        <CommandItem key={item.id} onSelect={() => handleAction(item.action)}>
                            {item.icon}
                            <span>{item.label}</span>
                            {item.shortcut && <CommandShortcut>{item.shortcut}</CommandShortcut>}
                        </CommandItem>
                    ))}
                </CommandGroup>

                <CommandSeparator />

                <CommandGroup heading="导航">
                    {navigationActions.map((item) => (
                        <CommandItem key={item.id} onSelect={() => handleAction(item.action)}>
                            {item.icon}
                            <span>{item.label}</span>
                        </CommandItem>
                    ))}
                </CommandGroup>
            </CommandList>
        </CommandDialog>
    )
}
