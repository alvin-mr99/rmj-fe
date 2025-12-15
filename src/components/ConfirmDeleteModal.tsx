import { Show } from 'solid-js';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  itemName?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDeleteModal(props: ConfirmDeleteModalProps) {
  return (
    <Show when={props.isOpen}>
      <div 
        class="fixed inset-0 bg-black/60 backdrop-blur-sm z-[2500] flex items-center justify-center p-4 animate-fade-in"
        onClick={props.onCancel}
      >
        <div 
          class="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-scale-in"
          onClick={(e) => e.stopPropagation()}
          style={{ "font-family": "'Poppins', sans-serif" }}
        >
          {/* Header with Warning Icon */}
          <div class="bg-gradient-to-r from-red-500 to-pink-500 px-6 py-5">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center animate-pulse">
                <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div class="flex-1">
                <h3 class="text-xl font-bold text-white">
                  {props.title}
                </h3>
              </div>
            </div>
          </div>

          {/* Content */}
          <div class="px-6 py-6">
            <p class="text-gray-700 text-base mb-2">
              {props.message}
            </p>
            <Show when={props.itemName}>
              <div class="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div class="flex items-start gap-3">
                  <svg class="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div class="flex-1">
                    <p class="text-sm text-red-800 font-medium mb-1">Item yang akan dihapus:</p>
                    <p class="text-sm text-red-900 font-bold break-words">
                      {props.itemName}
                    </p>
                  </div>
                </div>
              </div>
            </Show>
            <div class="mt-5 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <div class="flex items-start gap-2">
                <svg class="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p class="text-xs text-amber-800 font-medium">
                  Tindakan ini tidak dapat dibatalkan. Data yang sudah dihapus tidak bisa dikembalikan.
                </p>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div class="flex items-center gap-3 px-6 py-4 bg-gray-50 border-t border-gray-200">
            <button
              type="button"
              onClick={props.onCancel}
              class="flex-1 px-5 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 font-semibold transition-all shadow-sm"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={props.onConfirm}
              class="flex-1 px-5 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 font-semibold transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Hapus
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scale-in {
          from {
            transform: scale(0.95);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }

        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }

        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
      `}</style>
    </Show>
  );
}
