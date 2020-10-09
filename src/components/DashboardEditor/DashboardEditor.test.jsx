import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

import { Link } from '../..';

import DashboardEditor from './DashboardEditor';

describe('DashboardEditor', () => {
  const mockValueCard = {
    id: 'Standard',
    title: 'value card',
    type: 'VALUE',
    size: 'MEDIUM',
    content: {
      attributes: [
        {
          dataSourceId: 'key1',
          unit: '%',
          label: 'Key 1',
        },
        {
          dataSourceId: 'key2',
          unit: 'lb',
          label: 'Key 2',
        },
      ],
    },
  };
  const mockOnImport = jest.fn();
  const mockOnExport = jest.fn();
  const mockOnCancel = jest.fn();
  const mockOnSubmit = jest.fn();

  const commonProps = {
    title: 'My dashboard',
    headerBreadcrumbs: [
      <Link href="www.ibm.com">Dashboard library</Link>,
      <Link href="www.ibm.com">Favorites</Link>,
    ],
    onImport: mockOnImport,
    onExport: mockOnExport,
    onCancel: mockOnCancel,
    onSubmit: mockOnSubmit,
  };

  it('selecting edit card should select the card', () => {
    render(<DashboardEditor {...commonProps} initialValue={{ cards: [mockValueCard] }} />);
    // no card should be selected, meaning the gallery should be open
    const galleryTitle = screen.getByText('Gallery');
    expect(galleryTitle).toBeInTheDocument();
    // first find and click the cards overflow menu
    const cardOverflowMenu = screen.getByTitle('Open and close list of options');
    expect(cardOverflowMenu).toBeInTheDocument();
    fireEvent.click(cardOverflowMenu);
    // once open, find and click the edit card option
    const editCardBtn = screen.getByText('Edit card');
    expect(editCardBtn).toBeInTheDocument();
    fireEvent.click(editCardBtn);
    // gallery title should be gone and the card edit form should be open
    expect(galleryTitle).not.toBeInTheDocument();
    const openGalleryBtn = screen.getByText('Open gallery');
    expect(openGalleryBtn).toBeInTheDocument();
    const cardSizeFormInput = screen.getByText('Medium (4x2)');
    expect(cardSizeFormInput).toBeInTheDocument();
  });

  it('selecting clone card should duplicate card', () => {
    render(<DashboardEditor {...commonProps} initialValue={{ cards: [mockValueCard] }} />);
    // there should only be one card with the same title to start
    expect(screen.getAllByText('value card')).toHaveLength(1);
    // first find and click the cards overflow menu
    const cardOverflowMenu = screen.getByTitle('Open and close list of options');
    expect(cardOverflowMenu).toBeInTheDocument();
    fireEvent.click(cardOverflowMenu);
    // once open, find and click the edit card option
    const cloneCardBtn = screen.getByText('Clone card');
    expect(cloneCardBtn).toBeInTheDocument();
    fireEvent.click(cloneCardBtn);
    // there should now be two cards with the same title
    expect(screen.getAllByText('value card')).toHaveLength(2);
  });

  it('selecting remove card should remove card', () => {
    render(<DashboardEditor {...commonProps} initialValue={{ cards: [mockValueCard] }} />);
    // there should only be one card with the same title to start
    expect(screen.getAllByText('value card')).toHaveLength(1);
    // first find and click the cards overflow menu
    const cardOverflowMenu = screen.getByTitle('Open and close list of options');
    expect(cardOverflowMenu).toBeInTheDocument();
    fireEvent.click(cardOverflowMenu);
    // once open, find and click the edit card option
    const deleteCardBtn = screen.getByText('Delete card');
    expect(deleteCardBtn).toBeInTheDocument();
    fireEvent.click(deleteCardBtn);
    // there should now be zero cards with the same title
    expect(screen.queryAllByText('value card')).toHaveLength(0);
  });

  it('selecting card type in gallery should add card', () => {
    render(<DashboardEditor {...commonProps} />);
    // first find and click Simple bar
    const simpleBarBtn = screen.getByTestId('card-gallery-list-BAR-add');
    expect(simpleBarBtn).toBeInTheDocument();
    fireEvent.click(simpleBarBtn);
    // then find the card title that was created
    expect(screen.getAllByTitle('Untitled')).toHaveLength(1);
    // re-open the gallery by clicking open gallery
    const openGalleryBtn = screen.getByText('Open gallery');
    expect(openGalleryBtn).toBeInTheDocument();
    fireEvent.click(openGalleryBtn);
    // now find and click Time series
    const timeSeriesBtn = screen.getByTestId('card-gallery-list-TIMESERIES-add');
    expect(timeSeriesBtn).toBeInTheDocument();
    fireEvent.click(timeSeriesBtn);
    // then find the card title that was created, but these will have the same names so check the length
    expect(screen.getAllByTitle('Untitled')).toHaveLength(2);
  });

  it('selecting submit should fire onSubmit', () => {
    render(<DashboardEditor {...commonProps} />);
    // find and click submit button
    const submitBtn = screen.getByText('Save and close');
    expect(submitBtn).toBeInTheDocument();
    fireEvent.click(submitBtn);
    expect(mockOnSubmit).toBeCalledWith({
      cards: [],
      layouts: {},
    });
  });

  it('selecting cancel should fire onCancel', () => {
    render(<DashboardEditor {...commonProps} />);
    // find and click submit button
    const cancelBtn = screen.getByText('Cancel');
    expect(cancelBtn).toBeInTheDocument();
    fireEvent.click(cancelBtn);
    expect(mockOnCancel).toBeCalled();
  });

  it('changing title in CardEditForm should change rendered card title', () => {
    render(<DashboardEditor {...commonProps} />);
    // add a card
    const valueBtn = screen.getByTestId('card-gallery-list-VALUE-add');
    expect(valueBtn).toBeInTheDocument();
    fireEvent.click(valueBtn);
    // card edit form should be open
    const cardSizeFormInput = screen.getByDisplayValue('Untitled');
    expect(cardSizeFormInput).toBeInTheDocument();
    fireEvent.change(cardSizeFormInput, { target: { value: 'My new card title' } });
    expect(screen.getByTitle('My new card title')).toBeInTheDocument();
  });
});
