export type Member = {
    id: number;
    name: string;
    spent: string;
    paid: string;
};

export type Item = {
    id: number;
    name: string;
    price: string;
    paidFor: number[];
    paidBy: number | null;
}