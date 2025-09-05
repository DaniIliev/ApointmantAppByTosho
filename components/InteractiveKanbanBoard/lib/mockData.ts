import { v4 as uuidv4 } from "uuid";
import {
  KanbanBoardColumn,
  KanbanBoardListItem,
  KanbanBoardType,
  KanbanTask,
} from "@/app/taskManager/types";
import { UserPossibleAssignes } from "../KanbanboardUtils";

// Мокнат списък с потребители
export const mockUsers: UserPossibleAssignes[] = [
  { user_id: "user-1", user_name: "Ivan Petrov", profile_picture_url: null },
  {
    user_id: "user-2",
    user_name: "Maria Georgieva",
    profile_picture_url: null,
  },
  { user_id: "user-3", user_name: "Georgi Ivanov", profile_picture_url: null },
  { user_id: "user-4", user_name: "Elena Popova", profile_picture_url: null },
];

const mockPriorities = ["Low", "Medium", "High", "Critical"];
const mockStatuses = ["Planned", "In Progress", "Finished"];

// Функция за генериране на мокнати задачи
const generateMockTask = (
  columnId: string,
  order: number,
  index: number
): KanbanTask => {
  const isFinished = Math.random() < 0.2; // 20% шанс задачата да е завършена
  const assignees =
    Math.random() < 0.7
      ? [mockUsers[Math.floor(Math.random() * mockUsers.length)]]
      : [];

  return {
    object_id: uuidv4(),
    column_id: columnId,
    order: order,
    title: `Task ${index + 1}`,
    description: `Description for task ${
      index + 1
    }. This is a detailed description to test the modal view.`,
    planned_end_date: new Date(
      Date.now() + Math.random() * 86400000 * 30
    ).toISOString(),
    priority: mockPriorities[Math.floor(Math.random() * mockPriorities.length)],
    status: isFinished
      ? "Finished"
      : mockStatuses[Math.floor(Math.random() * (mockStatuses.length - 1))],
    assignees: assignees,
    meta: {
      creator_id: mockUsers[0].user_id,
      creator_name: mockUsers[0].user_name,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    get_object_url: null,
  };
};

// Функция за генериране на мокнат канбан борд
const generateMockKanbanBoard = (
  id: string,
  title: string
): KanbanBoardType => {
  const columns: KanbanBoardColumn[] = [
    { id: uuidv4(), title: "To Do", order: 1 },
    { id: uuidv4(), title: "In Progress", order: 2 },
    { id: uuidv4(), title: "Finished", order: 3 },
  ];

  const cards: KanbanTask[] = [];
  let orderCounter = 0;

  columns.forEach((col, colIndex) => {
    const numCards = colIndex === 2 ? 3 : 5; // Повече задачи в "Finished"
    for (let i = 0; i < numCards; i++) {
      cards.push(generateMockTask(col.id, orderCounter, i));
      orderCounter++;
    }
  });

  return {
    cards: cards,
    columns: columns,
    config: {},
  };
};

// Функция за генериране на списък с бордове (за dropdown)
const generateMockKanbanBoardList = (count: number): KanbanBoardListItem[] => {
  const list = [];
  for (let i = 0; i < count; i++) {
    list.push({
      id: uuidv4(),
      title: `Board ${i + 1} - A project board`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }
  return list;
};

// Изберете бордовете, които ще използвате
export const mockKanbanBoardsList: KanbanBoardListItem[] =
  generateMockKanbanBoardList(4);

// Генериране на пълните данни за бордовете
const mockFullBoards: { [key: string]: KanbanBoardType } = {};
mockKanbanBoardsList.forEach((board) => {
  mockFullBoards[board.id] = generateMockKanbanBoard(board.id, board.title);
});

export const getMockKanbanBoardById = (id: string): KanbanBoardType | null => {
  return mockFullBoards[id] || null;
};

export const getMockKanbanBoardsList = (): KanbanBoardListItem[] => {
  return mockKanbanBoardsList;
};
