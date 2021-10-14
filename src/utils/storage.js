const STORAGE_ID = "tolerance_calculator_items";

export function getItems (){
    let data = localStorage.getItem(STORAGE_ID);
    return data ? JSON.parse(data) : [];
}
export function setItem (item){
    const items = [ ...getItems(), item ];
    localStorage.setItem(STORAGE_ID, JSON.stringify(items));
}
export function deleteItem (id){
    const items = [ ...getItems() ];
    const index = items.findIndex(p => p.id === id);
    if (index < 0) return;
    items.splice(index, 1)
    localStorage.setItem(STORAGE_ID, JSON.stringify(items));
}