import React from 'react';

type Props = {
    children: React.ReactNode;
    header: React.ReactNode;
    footer?: React.ReactNode;
};

export default function Modal({ children, header, footer }: Props) {

  return (
        <>
            <div
                className="w-screen md:h-auto justify-center overflow-auto items-center flex fixed inset-0 z-50 outline-none focus:outline-none"
            >
                <div className="flex flex-col md:w-1/2 lg:max-w-lg mx-auto">
                    {/* content */}
                    <div
                        className="border-0 h-auto md:h-auto py-10 w-screen md:w-auto md:rounded-lg shadow-lg relative flex flex-col bg-white outline-none focus:outline-none"
                    >
                        {/* header */}
                        <div
                            className="text-2xl flex items-start justify-between p-4 border-b border-solid border-slate-200 rounded-t"
                        >
                            {header}
                        </div>
                        {/* body */}
                        <div className="relative p-6 flex-auto grow">
                            {children}
                        </div>
                        {/* footer */}
                        {footer &&
                            <div
                                className="p-4 border-t border-solid border-slate-200 rounded-b"
                            >
                                {footer}
                            </div>
                        }
                    </div>
                </div>
            </div>
            <div className="opacity-25 fixed inset-0 z-40 bg-black"></div>
        </>
  );
}
