// intranet-frontend/app/page.tsx

async function getPages() {
  // Делаем запрос к API Wagtail
  const res = await fetch('http://127.0.0.1:8000/api/v2/pages/', {
    next: { revalidate: 10 }, 
  });

  if (!res.ok) {
    throw new Error('Failed to fetch data from Wagtail');
  }

  return res.json();
}

export default async function Home() {
  const data = await getPages();
  // Wagtail возвращает массив страниц в объекте items
  const pages = data.items || [];

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans">
      <main className="max-w-4xl mx-auto">
        
        <header className="mb-12 border-b border-slate-200 pb-6">
          <h1 className="text-4xl font-bold text-slate-800 tracking-tight">
            Интранет Engineering College Light Academy
          </h1>
          <p className="text-slate-500 mt-2 text-lg">
            Внутренний портал. Статус API: <span className="text-emerald-500 font-semibold">Подключено</span>
          </p>
        </header>

        <section>
          <h2 className="text-2xl font-semibold text-slate-700 mb-6">Опубликованные страницы:</h2>
          
          <div className="grid gap-4 md:grid-cols-2">
            {pages.length > 0 ? (
              pages.map((page: any) => (
                <div 
                  key={page.id} 
                  className="p-6 bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow"
                >
                  <h3 className="text-xl font-medium text-slate-900 mb-2">
                    {page.title}
                  </h3>
                  <div className="text-sm text-slate-500 space-y-1">
                    <p>ID страницы: {page.id}</p>
                    <p>Тип контента: {page.meta.type}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-slate-500 italic">Нет доступных страниц. Добавьте их в админке Wagtail.</p>
            )}
          </div>
        </section>

      </main>
    </div>
  );
}