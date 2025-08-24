import React from 'react';

const NOTION_URL = '/jivo-hub/Jivo Doctor Partner Hub 23f644c03db9803bbda0d8e18edddc79.html';

const NotionPage = ({ onSignOut }) => {
  return (
    <div className="w-full h-screen flex flex-col font-inter">
      {/* Custom header with updated Jivo styling */}
      <header className="bg-jivo-blue text-white p-4 flex justify-between items-center shadow-lg">
        <h1 className="text-xl font-bold">Jivo Doctor Partner Hub</h1>
        <button
          onClick={onSignOut}
          className="bg-jivo-yellow hover:opacity-90 text-jivo-blue-dark font-bold py-2 px-4 rounded-xl transition duration-300 shadow-md"
        >
          Sign Out
        </button>
      </header>
      
      {/* The iframe that embeds the Notion page */}
      <main className="flex-1">
        <iframe
          src={NOTION_URL}
          className="w-full h-full border-0"
          title="Jivo Doctor Partner Hub"
        />
      </main>
    </div>
  );
};

export default NotionPage;
