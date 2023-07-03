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
                className="w-full justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none"
            >
                <div className="relative w-full md:w-1/2 lg:max-w-lg my-6 mx-auto">
                    {/* content */}
                    <div
                        className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none"
                    >
                        {/* header */}
                        <div
                            className="text-2xl flex items-start justify-between p-4 border-b border-solid border-slate-200 rounded-t"
                        >
                            {header}
                        </div>
                        {/* body */}
                        <div className="relative p-6 flex-auto overflow-auto">
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
