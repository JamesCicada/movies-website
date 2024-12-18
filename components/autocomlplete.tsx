"use client";
import { FC, useEffect, useState } from "react";
import {
  Autocomplete,
  AutocompleteSection,
  AutocompleteItem,
  Avatar,
} from "@nextui-org/react";
import { useRouter } from "next/navigation";
interface AutoCompleteProps {
  CallCloseMenu: () => void; // Define the prop type
}
export const AutoComplete: FC<AutoCompleteProps> = ({ CallCloseMenu }) => {
  const [options, setOptions] = useState<any>();
  const [query, setQuery] = useState<string>();
  const [loading, setLoading] = useState<boolean>(false);
  useEffect(() => {
    if (!query || query.length < 3) return setOptions([]);
    setLoading(true);
    function getAnimes() {
      fetch(`/api/search?query=${query}`).then(async (res: any) => {
        const resData = await res.json();
        setOptions(resData.data.results);
        setLoading(false);
      });
    }
    getAnimes();
  }, [query]);
  const router = useRouter();
  function Watch(index: any) {
    CallCloseMenu();
    const { id, media_type } = options[Number(index)];
    router.push(`/watch/${media_type}/${id}`);
  }
  return (
    <Autocomplete
      onValueChange={setQuery}
      onClear={() => setQuery("")}
      isLoading={loading}
      items={options}
      placeholder="Search..."
      inputProps={{
        classNames: {
          input: "ml-1 w-full",
          inputWrapper: "h-[48px] w-full",
        },
      }}
      onSelectionChange={Watch}
      variant="bordered"
    >
      {options &&
        options.map((item: any, index: number) => (
          <AutocompleteSection>
            <AutocompleteItem
              key={index}
              startContent={
                <Avatar
                  name={item.title || item.name}
                  src={`https://image.tmdb.org/t/p/w500/${item.poster_path}`}
                  alt={`${item.title || item.name}'s Poster`}
                />
              }
            >
              <p className="text-tiny">{item.title || item.name}</p>
            </AutocompleteItem>
          </AutocompleteSection>
        ))}
    </Autocomplete>
  );
};
