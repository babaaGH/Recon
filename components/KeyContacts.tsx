'use client';

export default function KeyContacts() {
  const contacts = [
    { title: 'Head of Payments Technology' },
    { title: 'VP Digital Transformation' },
    { title: 'CTO' },
  ];

  return (
    <div className="border border-[#222222] rounded-lg p-6 bg-[#111111]">
      {/* Header */}
      <div className="text-sm font-semibold uppercase tracking-wider text-[#888888] mb-4">
        Key Contacts to Target
      </div>

      {/* Contact Cards */}
      <div className="space-y-3 mb-4">
        {contacts.map((contact, index) => (
          <div
            key={index}
            className="border border-[#222222] rounded-lg p-4 bg-black bg-opacity-40 hover:bg-[#1A1A1A] transition-colors"
          >
            <div className="flex items-center gap-3 mb-3">
              {/* Avatar Circle */}
              <div className="w-10 h-10 rounded-full bg-[#333333] flex-shrink-0"></div>

              {/* Title */}
              <div className="text-sm font-semibold text-[#E5E5E5]">
                {contact.title}
              </div>
            </div>

            {/* CTA Button */}
            <button className="w-full px-3 py-2 bg-[#007AFF] bg-opacity-10 border border-[#007AFF] border-opacity-20 rounded text-xs font-semibold text-[#007AFF] hover:bg-opacity-20 transition-all">
              Search LinkedIn for [Company]
            </button>
          </div>
        ))}
      </div>

      {/* Bottom Note */}
      <div className="text-xs text-[#888888] text-center pt-3 border-t border-[#222222]">
        Use LinkedIn Sales Navigator to identify and connect with these roles
      </div>
    </div>
  );
}
