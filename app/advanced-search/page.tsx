"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CardComponent } from "@/components/card"; // Ensure this is imported correctly
import {
  Button,
  Input,
  Pagination,
  Select,
  SelectItem,
  Tooltip,
} from "@nextui-org/react";
import { ArrowDown, ArrowUp, FilterX, SearchIcon } from "lucide-react";
import { genres, sortOptions, years } from "@/data/filterOptions"; // Create a reusable data file for genres, years, etc.

export default function AdvancedSearchPage() {
  const router = useRouter();
  const [movies, setMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [maxPages, setMaxPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedSort, setSelectedSort] = useState("popularity.desc");
  const [type, setType] = useState("tv");
  const [isOpen, setIsOpen] = useState(false);

  // Function: Fetch Movies using applied filters
  const fetchMovies = async () => {
    setLoading(true);

    const queryParams = new URLSearchParams();

    if (searchQuery) queryParams.append("keywords", searchQuery);
    if (selectedGenres.length > 0)
      queryParams.append("genres", selectedGenres.join(","));
    if (selectedYear) queryParams.append("year", selectedYear);
    if (selectedSort) queryParams.append("sortby", selectedSort);
    if (type) queryParams.append("type", type);
    if (currentPage) queryParams.append("page", currentPage.toString());
    // console.log(type);

    const res = await fetch(`/api/advancedsearch?${queryParams}`);
    const { data } = await res.json();
    // console.log(data);

    // Sort movies so those without a poster_path are at the end
    const sortedMovies = (data.results || []).sort((a: any, b: any) => {
      if (!a.poster_path && b.poster_path) return 1; // `a` has no poster, move it down
      if (a.poster_path && !b.poster_path) return -1; // `b` has no poster, move it down
      return 0; // Keep original order if both have or lack posters
    });

    setMovies(sortedMovies);
    setMaxPages(data.total_pages || 1);
    setLoading(false);
  };

  // UseEffect: Initial fetch
  useEffect(() => {
    fetchMovies();
  }, [
    selectedSort,
    selectedYear,
    selectedGenres,
    type,
    searchQuery,
    currentPage,
  ]);

  // Function: Handle Search button click
  const showAdvancedFilters = () => {
    setIsOpen(!isOpen);
    setSearchQuery("");
  };

  // Function: Handle Clear button click
  const handleClearFilters = async () => {
    setType("");
    setSelectedGenres([]);
    setSelectedYear("");
    setSelectedSort("popularity.desc");
    setSearchQuery("");
    setCurrentPage(1);
    router.push("/advanced-search");
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-4">Advanced Search</h1>
      <div className="flex my-3">
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search movies or shows..."
          isDisabled={isOpen}
          className=""
        />
        <Tooltip content="Apply Filters">
          <Button
            className="ml-4"
            variant="flat"
            onPress={showAdvancedFilters}
            isIconOnly
            startContent={
              <ArrowDown
                className={`transition-all transform ${isOpen && "rotate-180"}`}
              />
            }
          />
        </Tooltip>
      </div>
      <div
        className={`flex-col md:flex-row gap-4 mb-6 ${
          isOpen ? "flex" : "hidden"
        }`}
      >
        <Select
          placeholder="Select Genres"
          selectionMode="multiple"
          value={selectedGenres}
          onSelectionChange={(keys: any) => setSelectedGenres(Array.from(keys))}
        >
          {genres.map((genre) => (
            <SelectItem key={genre.id} value={genre.id.toString()}>
              {genre.name}
            </SelectItem>
          ))}
        </Select>

        <Select
          placeholder="Select Year"
          value={selectedYear}
          onSelectionChange={(year) => setSelectedYear(year as string)}
        >
          {years.map((year) => (
            <SelectItem key={year} value={year}>
              {year}
            </SelectItem>
          ))}
        </Select>

        <Select
          placeholder="Sort By"
          value={selectedSort}
          onSelectionChange={(sort) => setSelectedSort(sort as string)}
        >
          {sortOptions.map((option) => (
            <SelectItem key={option} value={option}>
              {option.replace(".", " ").toUpperCase()}
            </SelectItem>
          ))}
        </Select>

        <Select
          placeholder="Type"
          value={type}
          onSelectionChange={(type) => {
            setType(type.currentKey as string);
          }}
        >
          <SelectItem key={"movie"} value="movie">
            Movies
          </SelectItem>
          <SelectItem key={"tv"} value="tv">
            TV Shows
          </SelectItem>
        </Select>

        <Tooltip content="Clear Filters">
          <Button
            isIconOnly
            variant="flat"
            onPress={handleClearFilters}
            startContent={<FilterX />}
          />
        </Tooltip>
      </div>
      <Pagination
        isDisabled={loading}
        total={maxPages}
        color="secondary"
        page={currentPage}
        onChange={(page) => setCurrentPage(page)}
        className="my-6"
      />
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {movies.map((movie) => (
            <CardComponent
              key={movie.id}
              data={{ ...movie, media_type: movie.media_type || type }}
            />
          ))}
        </div>
      )}

      <Pagination
        isDisabled={loading}
        total={maxPages}
        color="secondary"
        page={currentPage}
        onChange={(page) => setCurrentPage(page)}
        className="mt-6"
      />
    </div>
  );
}
