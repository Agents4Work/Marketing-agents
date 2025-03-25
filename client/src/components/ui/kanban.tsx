'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  CSS,
} from '@dnd-kit/utilities';
import { cn } from '@/lib/utils';
import {
  createContext,
  useContext,
  useState,
  type FC,
  type HTMLAttributes,
  type ReactNode,
} from 'react';

export type KanbanContext = {
  onDragEnd: (event: DragEndEvent) => void;
  setActiveCard: (id: string | null) => void;
  activeCard: string | null;
};

const KanbanContext = createContext<KanbanContext>({
  onDragEnd: () => {},
  setActiveCard: () => {},
  activeCard: null,
});

export type KanbanProviderProps = {
  children: ReactNode;
  onDragEnd: (event: DragEndEvent) => void;
};

export const KanbanProvider: FC<KanbanProviderProps> = ({
  children,
  onDragEnd,
}) => {
  const [activeCard, setActiveCard] = useState<string | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  return (
    <KanbanContext.Provider value={{ onDragEnd, setActiveCard, activeCard }}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={onDragEnd}
        onDragStart={(event: DragStartEvent) => {
          setActiveCard(event.active.id as string);
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 overflow-auto">
          {children}
        </div>
        <DragOverlay>
          {activeCard ? <KanbanCardOverlay id={activeCard} /> : null}
        </DragOverlay>
      </DndContext>
    </KanbanContext.Provider>
  );
};

export type KanbanHeaderProps = {
  name: string;
  color: string;
};

export const KanbanHeader: FC<KanbanHeaderProps> = ({ name, color }) => (
  <div className="mb-2 sticky top-0 pt-4 pb-2 bg-white dark:bg-gray-950 z-10">
    <div className="flex items-center gap-2">
      <div
        className="h-2 w-2 rounded-full shrink-0 mt-0.5"
        style={{ backgroundColor: color }}
      />
      <span className="font-medium">{name}</span>
    </div>
  </div>
);

export type KanbanBoardProps = {
  children: ReactNode;
  id: string;
};

export const KanbanBoard: FC<KanbanBoardProps> = ({ children, id }) => {
  return (
    <div className="col-span-1 p-4">
      {children}
    </div>
  );
};

export type KanbanCardsProps = {
  children: ReactNode;
};

export const KanbanCards: FC<KanbanCardsProps> = ({ children }) => {
  const childrenArray = Array.isArray(children) ? children : [children];
  const items = childrenArray.map((child: any) => child?.props?.id || '');

  return (
    <SortableContext items={items} strategy={verticalListSortingStrategy}>
      <div className="space-y-2">{children}</div>
    </SortableContext>
  );
};

export type KanbanCardProps = {
  id: string;
  children: ReactNode;
  name: string;
  parent: string;
  index: number;
  className?: string;
};

export const KanbanCard: FC<KanbanCardProps> = ({
  id,
  children,
  name,
  parent,
  index,
  className,
}) => {
  const { setNodeRef, attributes, listeners, transform, transition, isDragging } =
    useSortable({
      id,
      data: {
        type: 'card',
        name,
        parent,
        index,
      },
    });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        'bg-white dark:bg-gray-800 p-3 rounded-md border shadow-sm cursor-grab',
        className
      )}
    >
      {children}
    </div>
  );
};

type KanbanCardOverlayProps = {
  id: string;
};

const KanbanCardOverlay: FC<KanbanCardOverlayProps> = ({ id }) => {
  return (
    <div className="bg-white dark:bg-gray-800 p-3 rounded-md border shadow-md min-w-40">
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-1">
          <p className="m-0 flex-1 font-medium text-sm">Card {id}</p>
          <p className="m-0 text-xs text-muted-foreground">Initiative</p>
        </div>
      </div>
    </div>
  );
};