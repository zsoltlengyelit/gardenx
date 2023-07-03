
export const Theme = {
  colors: {
    primary: 'bg-green-900',
    success: 'bg-green-600',
    'primary-inverse': 'bg-gray-100',
    danger: 'bg-red-600',
    transparent: 'bg-transparent',
    transparentOnDark: 'bg-transparent',
    warning: 'bg-orange-600',
    secondary: 'bg-gray-100'
  },
  textColor: {
    primary: 'text-white',
    success: 'text-white',
    'primary-inverse': 'text-gray-700',
    danger: 'text-white',
    transparent: 'text-gray-700',
    transparentOnDark: 'text-white',
    warning: 'text-white',
    secondary: 'text-gray-700'
  },
  components: {
    input: 'bg-gray-50 border border-gray-300 text-gray-900 text-md rounded-lg focus:ring-green-900 focus:border-green-900 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500'
  }
} as const;
